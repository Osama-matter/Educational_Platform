using EducationalPlatform.Application.DTOs.Auth;
using EducationalPlatform.Application.Interfaces;
using EducationalPlatform.Application.Interfaces.Services;
using EducationalPlatform.Application.Interfaces.Security;
using EducationalPlatform.Domain.Entities;
using EducationalPlatform.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;

namespace EducationalPlatform.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly RoleManager<IdentityRole<Guid>> _roleManager;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEmailService _emailService;

        public AuthService(UserManager<User> userManager, SignInManager<User> signInManager, RoleManager<IdentityRole<Guid>> roleManager, IJwtTokenService jwtTokenService, IHttpContextAccessor httpContextAccessor, IEmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _jwtTokenService = jwtTokenService;
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
                    throw new System.Exception($"Role creation failed: {errorDetails}");
                }
            }
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
                throw new System.Exception($"User creation failed: {errorDetails}");
            }

            await EnsureRoleExistsAsync(UserRole.Student.ToString());
            var addRoleResult = await _userManager.AddToRoleAsync(user, UserRole.Student.ToString());
            if (!addRoleResult.Succeeded)
            {
                var errorDetails = string.Join("; ", addRoleResult.Errors.Select(e => e.Description));
                throw new System.Exception($"Assign role failed: {errorDetails}");
            }

            try
            {
                await _emailService.SendWelcomeEmailAsync(user.Email, user.UserName);
            }
            catch (System.Exception ex)
            {
                // Email sending failure shouldn't fail user creation
                System.Console.WriteLine($"[AuthService Warning] Welcome email failed: {ex.Message}");
            }

            return new UserDto
            {
                Email = user.Email,
                Token = await _jwtTokenService.GenerateTokenAsync(user)
            };

        }

        public async Task<UserDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.Users.SingleOrDefaultAsync(x => x.Email == loginDto.Email);

            if (user == null)
            {
                throw new System.Exception("Invalid email");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

            if (!result.Succeeded)
            {
                throw new System.Exception("Invalid password");
            }

            if (user.Email is null)
            {
                throw new System.Exception("User email is missing");
            }

            var currentRoles = await _userManager.GetRolesAsync(user);
            if (currentRoles.Count == 0)
            {
                var roleName = user.Role.ToString();
                await EnsureRoleExistsAsync(roleName);
                await _userManager.AddToRoleAsync(user, roleName);
            }

            return new UserDto
            {
                Email = user.Email,
                Token = await _jwtTokenService.GenerateTokenAsync(user)
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
                throw new System.Exception($"Admin creation failed: {errorDetails}");
            }

            await EnsureRoleExistsAsync(UserRole.Admin.ToString());
            var addRoleResult = await _userManager.AddToRoleAsync(user, UserRole.Admin.ToString());
            if (!addRoleResult.Succeeded)
            {
                var errorDetails = string.Join("; ", addRoleResult.Errors.Select(e => e.Description));
                throw new System.Exception($"Assign role failed: {errorDetails}");
            }

            await _emailService.SendWelcomeEmailAsync(user.Email, user.UserName);

            return new UserDto
            {
                Email = user.Email,
                Token = await _jwtTokenService.GenerateTokenAsync(user)
            };
        }

        public Task LogoutAsync()
        {
            return _signInManager.SignOutAsync();
        }

        public async Task<UserDetailsDto> GetUserDetailsAsync()
        {
            var userEmail = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Email);

            if (string.IsNullOrEmpty(userEmail))
            {
                throw new System.Exception("User not authenticated or email claim is missing.");
            }

            var user = await _userManager.FindByEmailAsync(userEmail);

            if (user == null)
            {
                throw new System.Exception("User not found.");
            }

            return new UserDetailsDto
            {
                Username = user.UserName,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName
            };
        }
    }
}
