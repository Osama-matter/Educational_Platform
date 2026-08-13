using EducationalPlatform.Application.DTOs.Analytics;
using System.Threading.Tasks;

namespace EducationalPlatform.Application.Interfaces.Services
{
    public interface IAnalyticsService
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync();
        Task<UserRolesStatsDto> GetRolesStatsAsync();
    }
}
