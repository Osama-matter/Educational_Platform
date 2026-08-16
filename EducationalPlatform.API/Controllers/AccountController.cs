using EducationalPlatform.Application.DTOs.Auth;
using EducationalPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace EducationalPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public class AccountController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AccountController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                var userDto = await _authService.RegisterAsync(registerDto);
                return Ok(userDto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                var userDto = await _authService.LoginAsync(loginDto);
                return Ok(userDto);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("register-admin")]
        public async Task<ActionResult<UserDto>> RegisterAdmin([FromBody] RegisterAdminDto registerAdminDto)
        {
            try
            {
                var userDto = await _authService.RegisterAdminAsync(registerAdminDto);
                return Ok(userDto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserDto>> GetMe()
        {
            try
            {
                var currentUser = await _authService.GetCurrentUserAsync();
                return Ok(currentUser);
            }
            catch
            {
                return Unauthorized(new { message = "User session expired or not authenticated." });
            }
        }

        [HttpPost("Logout")]
        public async Task<IActionResult> Logout()
        {
            try
            {
                await _authService.LogoutAsync();
            }
            catch
            {
                // Ignored - signout completes
            }
            return Ok(new { message = "Logged out successfully." });
        }

        [HttpGet("details")]
        [Authorize]
        public async Task<ActionResult<UserDetailsDto>> GetUserDetails()
        {
            try
            {
                var userDetails = await _authService.GetUserDetailsAsync();
                return Ok(userDetails);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }
    }
}