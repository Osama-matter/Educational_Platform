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
        public string Image_URl { get; set; }
        public decimal Price { get; set; }
        public int? EstimatedDurationHours { get; set; }
        public bool IsActive { get; set; }
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
            EstimatedDurationHours = course.EstimatedDurationHours;
            IsActive = course.IsActive;
            CreatedAt = course.CreatedAt;
            UpdatedAt = course.UpdatedAt;
            Image_URl = course.Image_URl;
            Price = course.Price;
            NumberOfSections = course.NumberOfSections;
        }
    }
}
