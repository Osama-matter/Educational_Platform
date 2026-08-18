using System;
using EducationalPlatform.Domain.Entities.Leeson;

namespace EducationalPlatform.Application.DTOs.Lessons
{
    public class UpdateLessonDto
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public string? VideoUrl { get; set; }
        public int OrderIndex { get; set; }
        public int? DurationMinutes { get; set; }

        public void ApplyTo(Lesson lesson)
        {
            lesson.Title = Title;
            lesson.Content = Content;
            lesson.VideoUrl = VideoUrl;
            lesson.OrderIndex = OrderIndex;
            lesson.DurationMinutes = DurationMinutes;
        }
    }
}
