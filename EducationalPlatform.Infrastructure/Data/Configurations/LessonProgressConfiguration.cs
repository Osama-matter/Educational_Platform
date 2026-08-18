using EducationalPlatform.Domain.Entities.progress;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EducationalPlatform.Infrastructure.Data.Configurations
{
    public class LessonProgressConfiguration : IEntityTypeConfiguration<LessonProgress>
    {
        public void Configure(EntityTypeBuilder<LessonProgress> builder)
        {
            builder.HasIndex(lp => new { lp.EnrollmentId, lp.LessonId })
                   .IsUnique();

            builder.HasOne(lp => lp.Enrollment)
                   .WithMany(e => e.LessonProgresses)
                   .HasForeignKey(lp => lp.EnrollmentId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(lp => lp.Lesson)
                   .WithMany(l => l.LessonProgresses)
                   .HasForeignKey(lp => lp.LessonId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
