using System;
using System.Collections.Generic;

namespace EducationalPlatform.Application.DTOs.Analytics
{
    public class DashboardStatsDto
    {
        public int TotalStudents { get; set; }
        public int TotalCourses { get; set; }
        public int TotalCertificates { get; set; }
        public decimal TotalRevenue { get; set; }
        public List<RecentActivityDto> RecentActivities { get; set; } = new List<RecentActivityDto>();
    }

    public class RecentActivityDto
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "enrollment" | "certificate"
        public string Title { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }

    public class UserRolesStatsDto
    {
        public int AdminCount { get; set; }
        public int InstructorCount { get; set; }
        public int StudentCount { get; set; }
    }
}
