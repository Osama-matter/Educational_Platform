using EducationalPlatform.Application.DTOs.Auth;
using System.Threading.Tasks;

namespace EducationalPlatform.Application.Interfaces
{
    public interface IAuthService
    {
        Task<UserDto> RegisterAsync(RegisterDto registerDto);
        Task<UserDto> LoginAsync(LoginDto loginDto);
        Task<UserDto> RegisterAdminAsync(RegisterAdminDto registerAdminDto);
        Task<UserDto> GetCurrentUserAsync();
        Task LogoutAsync();
        Task<UserDetailsDto> GetUserDetailsAsync();  
    }
}
