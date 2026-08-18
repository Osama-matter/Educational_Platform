using EducationalPlatform.Domain.Entities.progress;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EducationalPlatform.Domain.Entities.Leeson
{
    public class Lesson
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [ForeignKey(nameof(Course))]
        public Guid CourseId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [Required]
        [MaxLength(10000)]
        public string Content { get; set; }

        [MaxLength(2000)]
        public string? VideoUrl { get; set; }

        [Required]
        public int OrderIndex { get; set; }

        public int? DurationMinutes { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Course.Course Course { get; set; }
        public virtual ICollection<LessonProgress> LessonProgresses { get; set; }

        public virtual ICollection<EducationalPlatform.Domain.Entities.Course_File.CourseFile> CourseFiles { get; set; }
        public virtual ICollection<Quiz> Quizzes { get; set; }

        public Lesson()
        {
            Id = Guid.NewGuid();
            CreatedAt = DateTime.UtcNow;
            LessonProgresses = new HashSet<LessonProgress>();
            Quizzes = new HashSet<Quiz>();
        }

        public Lesson(Guid courseId, string title, string content, int orderIndex, int? durationMinutes, string? videoUrl = null)
            : this()
        {
            CourseId = courseId;
            Title = title;
            Content = content;
            OrderIndex = orderIndex;
            DurationMinutes = durationMinutes;
            VideoUrl = videoUrl;
        }
    }
}
