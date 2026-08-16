using EducationalPlatform.Application.DTOs.Progress;
using EducationalPlatform.Application.Interfaces.Repositories;
using EducationalPlatform.Application.Interfaces.Services;
using EducationalPlatform.Domain.Entities;
using EducationalPlatform.Domain.Entities.progress;
using EducationalPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EducationalPlatform.Infrastructure.Services
{
    public class ProgressServices : IProgressService
    {
        private readonly ILessonProgressRepository _lessonProgressRepository;
        private readonly ApplicationDbContext _context;

        public ProgressServices(
            ILessonProgressRepository lessonProgressRepository,
            ApplicationDbContext context)
        {
            _lessonProgressRepository = lessonProgressRepository;
            _context = context;
        }

        public async Task<LessonProgressDto> CreateAsync(CreateLessonProgressDto createLessonProgress)
        {
            var lessonProgressEntity = createLessonProgress.ToEntity();
            lessonProgressEntity.IsCompleted = true;
            lessonProgressEntity.CompletedAt = DateTime.UtcNow;
            await _lessonProgressRepository.AddAsync(lessonProgressEntity);

            return new LessonProgressDto
            {
                Id = lessonProgressEntity.Id,
                EnrollmentId = lessonProgressEntity.EnrollmentId,
                LessonId = lessonProgressEntity.LessonId,
                IsCompleted = lessonProgressEntity.IsCompleted,
                CompletedAt = lessonProgressEntity.CompletedAt
            };
        }

        public async Task DeleteAsync(Guid id)
        {
            var lessonProgress = await _lessonProgressRepository.GetByIdAsync(id);
            if (lessonProgress == null)
            {
                throw new KeyNotFoundException("Lesson progress not found");
            }
            _lessonProgressRepository.DeleteAsync(lessonProgress);
        }

        public async Task<IEnumerable<LessonProgressDto>> GetAllAsync()
        {
            var data = await _lessonProgressRepository.GetAllAsync();
            if (data == null || !data.Any())
            {
                return Enumerable.Empty<LessonProgressDto>();
            }

            return data.Select(lp => new LessonProgressDto
            {
                Id = lp.Id,
                EnrollmentId = lp.EnrollmentId,
                LessonId = lp.LessonId,
                IsCompleted = lp.IsCompleted,
                CompletedAt = lp.CompletedAt
            });
        }

        public async Task<LessonProgressDto> GetByIdAsync(Guid id)
        {
            var lessonProgress = await _lessonProgressRepository.GetByIdAsync(id);
            if (lessonProgress == null)
            {
                throw new KeyNotFoundException("Lesson progress not found");
            }

            return new LessonProgressDto
            {
                Id = lessonProgress.Id,
                EnrollmentId = lessonProgress.EnrollmentId,
                LessonId = lessonProgress.LessonId,
                IsCompleted = lessonProgress.IsCompleted,
                CompletedAt = lessonProgress.CompletedAt
            };
        }

        public async Task<LessonProgressDto> CompleteLessonAsync(Guid lessonId, Guid? userId = null)
        {
            var lesson = await _context.Lessons.FirstOrDefaultAsync(l => l.Id == lessonId);
            if (lesson == null)
            {
                throw new KeyNotFoundException("Lesson not found");
            }

            var enrollmentQuery = _context.Enrollments.Where(e => e.CourseId == lesson.CourseId && e.IsActive);
            if (userId.HasValue)
            {
                enrollmentQuery = enrollmentQuery.Where(e => e.StudentId == userId.Value);
            }

            var enrollment = await enrollmentQuery.FirstOrDefaultAsync();
            if (enrollment == null)
            {
                if (userId.HasValue)
                {
                    enrollment = new Enrollment(userId.Value, lesson.CourseId);
                    await _context.Enrollments.AddAsync(enrollment);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    enrollment = await _context.Enrollments.FirstOrDefaultAsync(e => e.CourseId == lesson.CourseId && e.IsActive);
                    if (enrollment == null)
                    {
                        throw new InvalidOperationException("No active enrollment found for this course.");
                    }
                }
            }

            var progress = await _context.LessonProgresses
                .FirstOrDefaultAsync(lp => lp.EnrollmentId == enrollment.Id && lp.LessonId == lessonId);

            if (progress == null)
            {
                progress = new LessonProgress(enrollment.Id, lessonId)
                {
                    IsCompleted = true,
                    CompletedAt = DateTime.UtcNow
                };
                await _context.LessonProgresses.AddAsync(progress);
            }
            else
            {
                progress.IsCompleted = true;
                progress.CompletedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return new LessonProgressDto
            {
                Id = progress.Id,
                EnrollmentId = progress.EnrollmentId,
                LessonId = progress.LessonId,
                IsCompleted = progress.IsCompleted,
                CompletedAt = progress.CompletedAt
            };
        }

        public async Task<CourseProgressDto> GetCourseProgressAsync(Guid courseId, Guid? userId = null)
        {
            var lessons = await _context.Lessons
                .Where(l => l.CourseId == courseId)
                .Select(l => l.Id)
                .ToListAsync();

            if (!lessons.Any())
            {
                return new CourseProgressDto
                {
                    UserId = userId?.ToString() ?? string.Empty,
                    CourseId = courseId,
                    CompletedLessonIds = new List<Guid>(),
                    OverallProgressPercent = 0
                };
            }

            var enrollmentQuery = _context.Enrollments.Where(e => e.CourseId == courseId && e.IsActive);
            if (userId.HasValue)
            {
                enrollmentQuery = enrollmentQuery.Where(e => e.StudentId == userId.Value);
            }

            var enrollment = await enrollmentQuery.FirstOrDefaultAsync();
            if (enrollment == null)
            {
                return new CourseProgressDto
                {
                    UserId = userId?.ToString() ?? string.Empty,
                    CourseId = courseId,
                    CompletedLessonIds = new List<Guid>(),
                    OverallProgressPercent = 0
                };
            }

            var completedLessons = await _context.LessonProgresses
                .Where(lp => lp.EnrollmentId == enrollment.Id && lp.IsCompleted && lessons.Contains(lp.LessonId))
                .Select(lp => lp.LessonId)
                .Distinct()
                .ToListAsync();

            var percent = (int)Math.Round((double)completedLessons.Count / lessons.Count * 100);

            return new CourseProgressDto
            {
                UserId = userId?.ToString() ?? string.Empty,
                CourseId = courseId,
                CompletedLessonIds = completedLessons,
                OverallProgressPercent = percent
            };
        }
    }
}
