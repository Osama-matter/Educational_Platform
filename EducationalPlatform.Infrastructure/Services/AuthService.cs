using EducationalPlatform.Application.DTOs.Auth;
using EducationalPlatform.Application.Interfaces;
using EducationalPlatform.Application.Interfaces.Services;
using EducationalPlatform.Application.Interfaces.Security;
using EducationalPlatform.Domain.Entities;
using EducationalPlatform.Domain.Enums;
using EducationalPlatform.Infrastructure.Security;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace EducationalPlatform.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly RoleManager<IdentityRole<Guid>> _roleManager;
        private readonly IUserSessionManager _sessionManager;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEmailService _emailService;

        public AuthService(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            RoleManager<IdentityRole<Guid>> roleManager,
            IUserSessionManager sessionManager,
            IHttpContextAccessor httpContextAccessor,
            IEmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _sessionManager = sessionManager;
            _httpContextAccessor = httpContextAccessor;
            _emailService = emailService;
        }

        private async Task EnsureRoleExistsAsync(string roleName)
        {
            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                var result = await _roleManager.CreateAsync(new IdentityRole<Guid>(roleName));
                if (!result.Succeeded)
                {
                    var errorDetails = string.Join("; ", result.Errors.Select(e => e.Description));
                    throw new Exception($"Role creation failed: {errorDetails}");
                }
            }
        }

        private async Task InvalidatePreviousSessionIfPresentAsync()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext != null && httpContext.Request.Cookies.TryGetValue(SessionAuthenticationHandler.CookieName, out var existingSessionId))
            {
                if (!string.IsNullOrWhiteSpace(existingSessionId))
                {
                    await _sessionManager.InvalidateSessionAsync(existingSessionId);
                }
            }
        }

        private void SetAuthSessionCookie(string sessionId, DateTime expiresAt)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null) return;

            var isLocalhost = httpContext.Request.Host.Host.Contains("localhost") || httpContext.Request.Host.Host.Contains("127.0.0.1");
            var isSecure = !isLocalhost || httpContext.Request.IsHttps;

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = isSecure,
                SameSite = isSecure ? SameSiteMode.None : SameSiteMode.Lax,
                Expires = new DateTimeOffset(expiresAt),
                Path = "/"
            };

            httpContext.Response.Cookies.Append(SessionAuthenticationHandler.CookieName, sessionId, cookieOptions);
        }

        private void RemoveAuthSessionCookie()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null) return;

            var isLocalhost = httpContext.Request.Host.Host.Contains("localhost") || httpContext.Request.Host.Host.Contains("127.0.0.1");
            var isSecure = !isLocalhost || httpContext.Request.IsHttps;

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = isSecure,
                SameSite = isSecure ? SameSiteMode.None : SameSiteMode.Lax,
                Path = "/"
            };

            httpContext.Response.Cookies.Delete(SessionAuthenticationHandler.CookieName, cookieOptions);
        }

        public async Task<UserDto> RegisterAsync(RegisterDto registerDto)
        {
            var user = new User
            {
                UserName = registerDto.Username,
                Email = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Role = UserRole.Student
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                var errorDetails = string.Join("; ", result.Errors.Select(e => e.Description));
                throw new Exception($"User creation failed: {errorDetails}");
            }

            await EnsureRoleExistsAsync(UserRole.Student.ToString());
            var addRoleResult = await _userManager.AddToRoleAsync(user, UserRole.Student.ToString());
            if (!addRoleResult.Succeeded)
            {
                var errorDetails = string.Join("; ", addRoleResult.Errors.Select(e => e.Description));
                throw new Exception($"Assign role failed: {errorDetails}");
            }

            try
            {
                await _emailService.SendWelcomeEmailAsync(user.Email, user.UserName);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AuthService Warning] Welcome email failed: {ex.Message}");
            }

            // Session fixation protection: invalidate old session if present
            await InvalidatePreviousSessionIfPresentAsync();

            var roles = new List<string> { UserRole.Student.ToString() };
            var session = await _sessionManager.CreateSessionAsync(user, roles);
            SetAuthSessionCookie(session.SessionId, session.ExpiresAt);

            return new UserDto
            {
                Id = user.Id,
                Username = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty,
                Roles = roles
            };
        }

        public async Task<UserDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.Users.SingleOrDefaultAsync(x => x.Email == loginDto.Email);

            if (user == null)
            {
                throw new Exception("Invalid email or password");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

            if (!result.Succeeded)
            {
                throw new Exception("Invalid email or password");
            }

            if (user.Email is null)
            {
                throw new Exception("Invalid email or password");
            }

            var currentRoles = (await _userManager.GetRolesAsync(user)).ToList();
            if (currentRoles.Count == 0)
            {
                var roleName = user.Role.ToString();
                await EnsureRoleExistsAsync(roleName);
                await _userManager.AddToRoleAsync(user, roleName);
                currentRoles.Add(roleName);
            }

            // Session fixation protection: invalidate old session before creating a fresh authenticated session
            await InvalidatePreviousSessionIfPresentAsync();

            var session = await _sessionManager.CreateSessionAsync(user, currentRoles);
            SetAuthSessionCookie(session.SessionId, session.ExpiresAt);

            return new UserDto
            {
                Id = user.Id,
                Username = user.UserName ?? string.Empty,
                Email = user.Email,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty,
                Roles = currentRoles
            };
        }

        public async Task<UserDto> RegisterAdminAsync(RegisterAdminDto registerAdminDto)
        {
            var user = new User
            {
                UserName = registerAdminDto.Username,
                Email = registerAdminDto.Email,
                FirstName = registerAdminDto.FirstName,
                LastName = registerAdminDto.LastName,
                Role = UserRole.Admin
            };

            var result = await _userManager.CreateAsync(user, registerAdminDto.Password);

            if (!result.Succeeded)
            {
                var errorDetails = string.Join("; ", result.Errors.Select(e => e.Description));
                throw new Exception($"Admin creation failed: {errorDetails}");
            }

            await EnsureRoleExistsAsync(UserRole.Admin.ToString());
            var addRoleResult = await _userManager.AddToRoleAsync(user, UserRole.Admin.ToString());
            if (!addRoleResult.Succeeded)
            {
                var errorDetails = string.Join("; ", addRoleResult.Errors.Select(e => e.Description));
                throw new Exception($"Assign role failed: {errorDetails}");
            }

            try
            {
                await _emailService.SendWelcomeEmailAsync(user.Email, user.UserName);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AuthService Warning] Welcome email failed: {ex.Message}");
            }

            // Session fixation protection: invalidate old session
            await InvalidatePreviousSessionIfPresentAsync();

            var roles = new List<string> { UserRole.Admin.ToString() };
            var session = await _sessionManager.CreateSessionAsync(user, roles);
            SetAuthSessionCookie(session.SessionId, session.ExpiresAt);

            return new UserDto
            {
                Id = user.Id,
                Username = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty,
                Roles = roles
            };
        }

        public async Task<UserDto> GetCurrentUserAsync()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            var userIdStr = httpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                throw new UnauthorizedAccessException("User not found.");
            }

            var roles = (await _userManager.GetRolesAsync(user)).ToList();

            return new UserDto
            {
                Id = user.Id,
                Username = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty,
                Roles = roles
            };
        }

        public async Task LogoutAsync()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext != null && httpContext.Request.Cookies.TryGetValue(SessionAuthenticationHandler.CookieName, out var sessionId))
            {
                if (!string.IsNullOrWhiteSpace(sessionId))
                {
                    await _sessionManager.InvalidateSessionAsync(sessionId);
                }
            }

            RemoveAuthSessionCookie();
            await _signInManager.SignOutAsync();
        }

        public async Task<UserDetailsDto> GetUserDetailsAsync()
        {
            var userEmail = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Email);

            if (string.IsNullOrEmpty(userEmail))
            {
                throw new Exception("User not authenticated or email claim is missing.");
            }

            var user = await _userManager.FindByEmailAsync(userEmail);

            if (user == null)
            {
                throw new Exception("User not found.");
            }

            var roles = (await _userManager.GetRolesAsync(user)).ToList();

            return new UserDetailsDto
            {
                Username = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty,
                Roles = roles
            };
        }
    }
}
