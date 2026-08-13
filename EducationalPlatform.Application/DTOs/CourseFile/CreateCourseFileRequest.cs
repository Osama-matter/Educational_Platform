using Microsoft.AspNetCore.Http;
using System;
using System.ComponentModel.DataAnnotations;

namespace EducationalPlatform.Application.DTOs.CourseFile
{
    public class CreateCourseFileRequest
    {
        [Required]
        public Guid CourseId { get; set; }

        public Guid? LessonId { get; set; }

        [Required]
        public IFormFile File { get; set; }

        public int? DurationSeconds { get; set; }

        public Guid UploadedById { get; set; }
    }
}
