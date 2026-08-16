using System;
using System.Collections.Generic;

namespace EducationalPlatform.Application.DTOs.Progress
{
    public class CourseProgressDto
    {
        public string UserId { get; set; } = string.Empty;
        public Guid CourseId { get; set; }
        public List<Guid> CompletedLessonIds { get; set; } = new();
        public int OverallProgressPercent { get; set; }
    }
}
