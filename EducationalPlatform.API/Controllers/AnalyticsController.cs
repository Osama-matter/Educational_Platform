using EducationalPlatform.Application.DTOs.Analytics;
using EducationalPlatform.Application.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace EducationalPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        /// <summary>
        /// Get real platform dashboard statistics and recent activity feed
        /// </summary>
        [HttpGet("dashboard")]
        [ProducesResponseType(typeof(DashboardStatsDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
        {
            var stats = await _analyticsService.GetDashboardStatsAsync();
            return Ok(stats);
        }

        /// <summary>
        /// Get user counts grouped by roles
        /// </summary>
        [HttpGet("roles")]
        [ProducesResponseType(typeof(UserRolesStatsDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<UserRolesStatsDto>> GetRolesStats()
        {
            var rolesStats = await _analyticsService.GetRolesStatsAsync();
            return Ok(rolesStats);
        }
    }
}
