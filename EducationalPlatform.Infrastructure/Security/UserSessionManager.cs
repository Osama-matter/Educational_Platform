using EducationalPlatform.Application.Interfaces.Security;
using EducationalPlatform.Domain.Entities;
using EducationalPlatform.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace EducationalPlatform.Infrastructure.Security
{
    public class UserSessionManager : IUserSessionManager
    {
        private readonly IMemoryCache _cache;
        private readonly ApplicationDbContext _dbContext;
        private readonly UserManager<User> _userManager;
        private static readonly ConcurrentDictionary<Guid, HashSet<string>> _userSessionIndex = new();
        private static readonly TimeSpan DefaultSessionLifetime = TimeSpan.FromDays(7);
        private const int SessionIdHexLength = 64; // 32 bytes in hex

        public UserSessionManager(IMemoryCache cache, ApplicationDbContext dbContext, UserManager<User> userManager)
        {
            _cache = cache;
            _dbContext = dbContext;
            _userManager = userManager;
        }

        public async Task<UserSession> CreateSessionAsync(User user, IList<string> roles, TimeSpan? lifetime = null)
        {
            var duration = lifetime ?? DefaultSessionLifetime;
            var sessionId = GenerateSecureSessionId();
            var expiresAt = DateTime.UtcNow.Add(duration);

            var session = new UserSession
            {
                SessionId = sessionId,
                UserId = user.Id,
                Username = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty,
                Roles = roles.ToList(),
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = expiresAt
            };

            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpiration = session.ExpiresAt
            };

            _cache.Set(GetCacheKey(sessionId), session, cacheOptions);

            _userSessionIndex.AddOrUpdate(user.Id,
                _ => new HashSet<string> { sessionId },
                (_, set) =>
                {
                    lock (set)
                    {
                        set.Add(sessionId);
                    }
                    return set;
                });

            // Persist session to Database RefreshTokens table for survivability across server recycles
            try
            {
                var dbToken = new EducationalPlatform.Domain.Entities.Auth.RefreshToken
                {
                    Token = sessionId,
                    UserId = user.Id,
                    ExpiryDate = expiresAt,
                    IsUsed = false,
                    IsRevoked = false
                };
                await _dbContext.RefreshTokens.AddAsync(dbToken);
                await _dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[UserSessionManager Warning] Failed to persist session to DB: {ex.Message}");
            }

            return session;
        }

        public async Task<UserSession?> GetSessionAsync(string sessionId)
        {
            if (!IsValidSessionIdFormat(sessionId))
            {
                return null;
            }

            // 1. Check L1 In-Memory Cache
            if (_cache.TryGetValue<UserSession>(GetCacheKey(sessionId), out var session) && session != null)
            {
                if (session.ExpiresAt > DateTime.UtcNow)
                {
                    return session;
                }

                _cache.Remove(GetCacheKey(sessionId));
                return null;
            }

            // 2. Cache miss (e.g. IIS / RunASP recycled app pool) -> fallback to Database
            try
            {
                var dbToken = await _dbContext.RefreshTokens
                    .Include(r => r.User)
                    .FirstOrDefaultAsync(r => r.Token == sessionId && !r.IsRevoked && r.ExpiryDate > DateTime.UtcNow);

                if (dbToken?.User != null)
                {
                    var user = dbToken.User;
                    var roles = (await _userManager.GetRolesAsync(user)).ToList();

                    var restoredSession = new UserSession
                    {
                        SessionId = sessionId,
                        UserId = user.Id,
                        Username = user.UserName ?? string.Empty,
                        Email = user.Email ?? string.Empty,
                        FirstName = user.FirstName ?? string.Empty,
                        LastName = user.LastName ?? string.Empty,
                        Roles = roles,
                        CreatedAt = DateTime.UtcNow,
                        ExpiresAt = dbToken.ExpiryDate
                    };

                    _cache.Set(GetCacheKey(sessionId), restoredSession, new MemoryCacheEntryOptions
                    {
                        AbsoluteExpiration = restoredSession.ExpiresAt
                    });

                    return restoredSession;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[UserSessionManager Warning] DB session lookup failed: {ex.Message}");
            }

            return null;
        }

        public async Task InvalidateSessionAsync(string sessionId)
        {
            if (!IsValidSessionIdFormat(sessionId))
            {
                return;
            }

            if (_cache.TryGetValue<UserSession>(GetCacheKey(sessionId), out var session) && session != null)
            {
                if (_userSessionIndex.TryGetValue(session.UserId, out var set))
                {
                    lock (set)
                    {
                        set.Remove(sessionId);
                    }
                }
            }

            _cache.Remove(GetCacheKey(sessionId));

            try
            {
                var dbToken = await _dbContext.RefreshTokens.FirstOrDefaultAsync(r => r.Token == sessionId);
                if (dbToken != null)
                {
                    dbToken.IsRevoked = true;
                    await _dbContext.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[UserSessionManager Warning] DB session revoke failed: {ex.Message}");
            }
        }

        public Task InvalidateUserSessionsAsync(Guid userId)
        {
            if (_userSessionIndex.TryRemove(userId, out var set))
            {
                lock (set)
                {
                    foreach (var sessionId in set)
                    {
                        _cache.Remove(GetCacheKey(sessionId));
                    }
                }
            }

            return Task.CompletedTask;
        }

        private static bool IsValidSessionIdFormat(string? sessionId)
        {
            if (string.IsNullOrWhiteSpace(sessionId) || sessionId.Length != SessionIdHexLength)
            {
                return false;
            }

            for (int i = 0; i < sessionId.Length; i++)
            {
                char c = sessionId[i];
                if (!((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F')))
                {
                    return false;
                }
            }

            return true;
        }

        private static string GenerateSecureSessionId()
        {
            var bytes = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(bytes);
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }

        private static string GetCacheKey(string sessionId) => $"auth_session_{sessionId}";
    }
}
