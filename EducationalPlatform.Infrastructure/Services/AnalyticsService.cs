using EducationalPlatform.Application.DTOs.Analytics;
using EducationalPlatform.Application.Interfaces.Services;
using EducationalPlatform.Domain.Enums;
using EducationalPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EducationalPlatform.Infrastructure.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICacheService _cacheService;
        private const string DashboardStatsCacheKey = "analytics_dashboard_stats";
        private const string RolesStatsCacheKey = "analytics_roles_stats";

        public AnalyticsService(ApplicationDbContext context, ICacheService cacheService)
        {
            _context = context;
            _cacheService = cacheService;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            return await _cacheService.GetOrCreateAsync(DashboardStatsCacheKey, async () =>
            {
                var totalStudents = await _context.Users.CountAsync(u => u.Role == UserRole.Student);
                if (totalStudents == 0)
                {
                    totalStudents = await _context.Users.CountAsync();
                }

                var totalCourses = await _context.Courses.CountAsync();
                var totalCertificates = await _context.Certificates.CountAsync(c => !c.IsRevoked);

                var totalRevenue = await _context.Enrollments
                    .Include(e => e.Course)
                    .Where(e => e.Course != null)
                    .SumAsync(e => (decimal?)e.Course.Price) ?? 0m;

                var recentEnrollments = await _context.Enrollments
                    .Include(e => e.Student)
                    .Include(e => e.Course)
                    .OrderByDescending(e => e.EnrolledAt)
                    .Take(5)
                    .Select(e => new RecentActivityDto
                    {
                        Id = e.Id.ToString(),
                        Type = "enrollment",
                        Title = $"قام الطالب \"{e.Student.FirstName} {e.Student.LastName}\" بالتسجيل في دورة {e.Course.Title}",
                        Details = "تسجيل جديد",
                        Timestamp = e.EnrolledAt
                    })
                    .ToListAsync();

                var recentCertificates = await _context.Certificates
                    .Include(c => c.User)
                    .Include(c => c.Course)
                    .OrderByDescending(c => c.IssuedAt)
                    .Take(5)
                    .Select(c => new RecentActivityDto
                    {
                        Id = c.Id.ToString(),
                        Type = "certificate",
                        Title = $"تم إصدار شهادة إتمام للطالب/ة \"{c.User.FirstName} {c.User.LastName}\"",
                        Details = "شهادة",
                        Timestamp = c.IssuedAt
                    })
                    .ToListAsync();

                var activities = recentEnrollments
                    .Concat(recentCertificates)
                    .OrderByDescending(a => a.Timestamp)
                    .Take(10)
                    .ToList();

                return new DashboardStatsDto
                {
                    TotalStudents = totalStudents,
                    TotalCourses = totalCourses,
                    TotalCertificates = totalCertificates,
                    TotalRevenue = totalRevenue,
                    RecentActivities = activities
                };
            }, TimeSpan.FromMinutes(2));
        }

        public async Task<UserRolesStatsDto> GetRolesStatsAsync()
        {
            return await _cacheService.GetOrCreateAsync(RolesStatsCacheKey, async () =>
            {
                var adminCount = await _context.Users.CountAsync(u => u.Role == UserRole.Admin);
                var instructorCount = await _context.Users.CountAsync(u => u.Role == UserRole.Instructor);
                var studentCount = await _context.Users.CountAsync(u => u.Role == UserRole.Student);

                return new UserRolesStatsDto
                {
                    AdminCount = adminCount,
                    InstructorCount = instructorCount,
                    StudentCount = studentCount
                };
            }, TimeSpan.FromMinutes(5));
        }
    }
}
