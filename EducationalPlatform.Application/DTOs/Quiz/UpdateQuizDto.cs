using System;

namespace EducationalPlatform.Application.DTOs.Quiz
{
    public class UpdateQuizDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime? AvailableFrom { get; set; }
        public DateTime? AvailableTo { get; set; }
        public int? DurationMinutes { get; set; }
        public int? TotalScore { get; set; }
        public int? PassingScore { get; set; }
        public bool? IsPublished { get; set; }
        public Guid? LessonId { get; set; }
    }
}
