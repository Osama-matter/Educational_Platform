using System;
using EducationalPlatform.Domain.Entities.Leeson;

namespace EducationalPlatform.Application.DTOs.Lessons
{
    public class CreateLessonDto
    {
        public Guid CourseId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string? VideoUrl { get; set; }
        public int OrderIndex { get; set; }
        public int? DurationMinutes { get; set; }

        public Lesson ToEntity()
        {
            return new Lesson(CourseId, Title, Content, OrderIndex, DurationMinutes);
        }
    }
}
