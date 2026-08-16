using System;
using System.Linq;
using EducationalPlatform.Domain.Entities;

namespace EducationalPlatform.Application.DTOs.Enrollments
{
    public class EnrollmentDto
    {
        public Guid Id { get; set; }
        public Guid StudentId { get; set; }
        public Guid CourseId { get; set; }
        public string CourseTitle { get; set; } = string.Empty;
        public string? CourseImageUrl { get; set; }
        public int ProgressPercent { get; set; }
        public DateTime EnrolledAt { get; set; }
        public bool IsActive { get; set; }
        public string? PaymentUrl { get; set; }

        public EnrollmentDto()
        {
        }

        public EnrollmentDto(Enrollment enrollment)
        {
            Id = enrollment.Id;
            StudentId = enrollment.StudentId;
            CourseId = enrollment.CourseId;
            EnrolledAt = enrollment.EnrolledAt;
            IsActive = enrollment.IsActive;
            CourseTitle = enrollment.Course?.Title ?? string.Empty;
            CourseImageUrl = enrollment.Course?.Image_URl;

            var totalLessons = enrollment.Course?.Lessons?.Count ?? 0;
            var completedLessons = enrollment.LessonProgresses?.Count(lp => lp.IsCompleted) ?? 0;
            ProgressPercent = totalLessons > 0 ? (int)Math.Round((double)completedLessons / totalLessons * 100) : 0;
        }
    }
}
