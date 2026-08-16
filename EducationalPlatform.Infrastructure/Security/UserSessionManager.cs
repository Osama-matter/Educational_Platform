using EducationalPlatform.Application.Interfaces.Security;
using EducationalPlatform.Domain.Entities;
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
        private static readonly ConcurrentDictionary<Guid, HashSet<string>> _userSessionIndex = new();
        private static readonly TimeSpan DefaultSessionLifetime = TimeSpan.FromDays(7);
        private const int SessionIdHexLength = 64; // 32 bytes in hex

        public UserSessionManager(IMemoryCache cache)
        {
            _cache = cache;
        }

        public Task<UserSession> CreateSessionAsync(User user, IList<string> roles, TimeSpan? lifetime = null)
        {
            var duration = lifetime ?? DefaultSessionLifetime;
            var sessionId = GenerateSecureSessionId();

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
                ExpiresAt = DateTime.UtcNow.Add(duration)
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

            return Task.FromResult(session);
        }

        public Task<UserSession?> GetSessionAsync(string sessionId)
        {
            if (!IsValidSessionIdFormat(sessionId))
            {
                return Task.FromResult<UserSession?>(null);
            }

            if (_cache.TryGetValue<UserSession>(GetCacheKey(sessionId), out var session) && session != null)
            {
                if (session.ExpiresAt > DateTime.UtcNow)
                {
                    return Task.FromResult<UserSession?>(session);
                }

                _cache.Remove(GetCacheKey(sessionId));
            }

            return Task.FromResult<UserSession?>(null);
        }

        public Task InvalidateSessionAsync(string sessionId)
        {
            if (!IsValidSessionIdFormat(sessionId))
            {
                return Task.CompletedTask;
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
            return Task.CompletedTask;
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
