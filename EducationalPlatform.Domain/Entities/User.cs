using EducationalPlatform.Domain.Entities.Auth;
using EducationalPlatform.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace EducationalPlatform.Domain.Entities {
    public class User : IdentityUser<Guid>
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; }

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; }

        [Required]
        public UserRole Role { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<Course.Course> CoursesCreated { get; set; }
        public virtual ICollection<Enrollment> Enrollments { get; set; }

        public virtual ICollection<Review> Reviews { get; set; }

        public ICollection<RefreshToken> RefreshTokens { get; set; }
        public User()
        {
            CreatedAt = DateTime.UtcNow;
            CoursesCreated = new HashSet<Course.Course>();
            Enrollments = new HashSet<Enrollment>();
        }
    }
}
