using EducationalPlatform.Domain.Entities;
using EducationalPlatform.Domain.Entities.Auth;
using EducationalPlatform.Domain.Entities.Course;
using EducationalPlatform.Domain.Entities.Course_File;
using EducationalPlatform.Domain.Entities.Leeson;
using EducationalPlatform.Domain.Entities.progress;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace EducationalPlatform.Infrastructure.Data
{
    public class ApplicationDbContext
     : IdentityDbContext<User, IdentityRole<Guid>, Guid>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Course> Courses { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<Lesson> Lessons { get; set; }
        public DbSet<LessonProgress> LessonProgresses { get; set; }
        public DbSet<CourseFile> CourseFiles { get; set; }
        public DbSet<Quiz> Quizzes { get; set; }

        public DbSet<Question> Questions { get; set; }

        public DbSet<QuizAttempt> QuizAttempts { get; set; }
        public DbSet<QuestionOption> QuestionOptions { get; set; }
        public DbSet<Answer> Answers { get; set; }

        public DbSet<Certificate> Certificates { get; set; }
        public DbSet<Review> Reviews { get; set; }

        public DbSet<ForumThread> ForumThreads { get; set; }

        public DbSet<ForumPost> forumPosts { get; set; }

        public DbSet<ForumPostVote> ForumPostVotes { get; set; }

        public DbSet<ForumSubscriptions> ForumSubscription { get; set; }

        public DbSet<RefreshToken> RefreshTokens { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        }
    }

}


          