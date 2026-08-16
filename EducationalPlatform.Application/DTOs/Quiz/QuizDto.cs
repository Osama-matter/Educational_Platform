using EducationalPlatform.Application.DTOs.Question;
using System;
using System.Collections.Generic;

namespace EducationalPlatform.Application.DTOs.Quiz
{
    public class QuizDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime AvailableFrom { get; set; }
        public DateTime AvailableTo { get; set; }
        public int DurationMinutes { get; set; }
        public int TotalScore { get; set; }
        public int PassingScore { get; set; }
        public int TotalTimeMinutes { get; set; }
        public bool IsPublished { get; set; }
        public Guid LessonId { get; set; }
        public List<QuestionDto> Questions { get; set; } = new List<QuestionDto>();
    }
}
