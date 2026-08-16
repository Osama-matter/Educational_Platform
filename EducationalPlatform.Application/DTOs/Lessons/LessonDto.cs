using System;
using System.Collections.Generic;
using System.Linq;
using EducationalPlatform.Domain.Entities.Leeson;
using EducationalPlatform.Domain.Enums;
using EducationalPlatform.Application.DTOs.Quiz;

namespace EducationalPlatform.Application.DTOs.Lessons
{
    public class LessonDto
    {
        public Guid Id { get; set; }
        public Guid CourseId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public int OrderIndex { get; set; }
        public int? DurationMinutes { get; set; }
        public string? VideoUrl { get; set; }
        public List<QuizSummaryDto> Quizzes { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public LessonDto()
        {
        }

        public LessonDto(Lesson lesson)
        {
            Id = lesson.Id;
            CourseId = lesson.CourseId;
            Title = lesson.Title;
            Content = lesson.Content;
            OrderIndex = lesson.OrderIndex;
            DurationMinutes = lesson.DurationMinutes;
            VideoUrl = lesson.CourseFiles?.FirstOrDefault(cf => cf.FileType == CourseFileType.Video)?.BlobStorageUrl;
            CreatedAt = lesson.CreatedAt;
            UpdatedAt = lesson.UpdatedAt;
        }
    }
}
