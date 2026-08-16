using EducationalPlatform.Application.DTOs.Lessons;
using EducationalPlatform.Application.DTOs.Quiz;
using EducationalPlatform.Application.DTOs.Review;
using System;
using System.Collections.Generic;

namespace EducationalPlatform.Application.DTOs.Courses
{
    public class CourseDetailsDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public Guid InstructorId { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("instructorName")]
        public string? InstructorName { get; set; }
        public string Image_URl { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("imageUrl")]
        public string? ImageUrl { get => Image_URl; set => Image_URl = value ?? string.Empty; }
        public int? EstimatedDurationHours { get; set; }
        public bool IsActive { get; set; }
        public decimal Price { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("rating")]
        public double Rating => (Reviews != null && Reviews.Any()) ? Math.Round(Reviews.Average(r => r.Rate), 1) : 0;
        [System.Text.Json.Serialization.JsonPropertyName("reviewsCount")]
        public int ReviewsCount => Reviews?.Count ?? 0;
        [System.Text.Json.Serialization.JsonPropertyName("enrolledStudentsCount")]
        public int EnrolledStudentsCount { get; set; }

        public int NumberOfSections { get; set; }
        public List<LessonDetailsDto> Lessons { get; set; } = new();
        public List<QuizSummaryDto> Quizzes { get; set; } = new();
        public List<ReviewDto> Reviews { get; set; } = new();
        public List<CourseFileDto> CourseFiles { get; set; } = new();
    }
}
