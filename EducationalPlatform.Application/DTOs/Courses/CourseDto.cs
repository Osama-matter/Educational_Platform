using System;
using EducationalPlatform.Domain.Entities.Course;
using EducationalPlatform.Application.DTOs.Review;
using System.Collections.Generic;
using EducationalPlatform.Application.DTOs.Lessons;
using EducationalPlatform.Application.DTOs.Quiz;

namespace EducationalPlatform.Application.DTOs.Courses
{
    public class CourseDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public ICollection<ReviewDto> Reviews { get; set; }
        public ICollection<CourseFileDto> CourseFiles { get; set; }
        public Guid InstructorId { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("instructorName")]
        public string? InstructorName { get; set; }
        public string Image_URl { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("imageUrl")]
        public string? ImageUrl { get => Image_URl; set => Image_URl = value ?? string.Empty; }
        public decimal Price { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("rating")]
        public double Rating => (Reviews != null && Reviews.Any()) ? Math.Round(Reviews.Average(r => r.Rate), 1) : 0;
        [System.Text.Json.Serialization.JsonPropertyName("reviewsCount")]
        public int ReviewsCount => Reviews?.Count ?? 0;
        public int? EstimatedDurationHours { get; set; }
        public bool IsActive { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("enrolledStudentsCount")]
        public int EnrolledStudentsCount { get; set; }
        public int NumberOfSections { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<LessonDetailsDto> Lessons { get; set; } = new();
        public List<QuizSummaryDto> Quizzes { get; set; } = new();
        public CourseDto()
        {
        }

        public CourseDto(Course course)
        {
            Id = course.Id;
            Title = course.Title;
            Description = course.Description;
            InstructorId = course.InstructorId;
            var fullName = course.Instructor != null ? $"{course.Instructor.FirstName} {course.Instructor.LastName}".Trim() : string.Empty;
            InstructorName = !string.IsNullOrEmpty(fullName)
                ? fullName
                : (!string.IsNullOrEmpty(course.Instructor?.UserName) ? course.Instructor.UserName : null);
            EstimatedDurationHours = course.EstimatedDurationHours;
            IsActive = course.IsActive;
            CreatedAt = course.CreatedAt;
            UpdatedAt = course.UpdatedAt;
            Image_URl = course.Image_URl;
            Price = course.Price;
            NumberOfSections = course.NumberOfSections;
            EnrolledStudentsCount = course.Enrollments?.Count(e => e.IsActive) ?? 0;
        }
    }
}
