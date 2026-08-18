using EducationalPlatform.Application.Interfaces.Repositories;
using EducationalPlatform.Domain.Entities.Course;
using EducationalPlatform.Domain.Entities.Leeson;
using EducationalPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EducationalPlatform.Infrastructure.Repositories
{
    public class LessonRepository : ILessonRepository
    {

        private readonly ApplicationDbContext _context;

        public LessonRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task AddAsync(Lesson Lesson)
        {
            _context.Lessons.Add(Lesson);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Lesson lesson)
        {
            // 1. Remove related lesson progresses explicitly to avoid any FK violation
            var progresses = await _context.LessonProgresses.Where(lp => lp.LessonId == lesson.Id).ToListAsync();
            if (progresses.Any())
            {
                _context.LessonProgresses.RemoveRange(progresses);
            }

            // 2. Remove related CourseFiles for this lesson
            var files = await _context.CourseFiles.Where(cf => cf.LessonId == lesson.Id).ToListAsync();
            if (files.Any())
            {
                _context.CourseFiles.RemoveRange(files);
            }

            // 3. Remove related Quizzes or nullify their lessonId
            var quizzes = await _context.Quizzes.Where(q => q.LessonId == lesson.Id).ToListAsync();
            if (quizzes.Any())
            {
                _context.Quizzes.RemoveRange(quizzes);
            }

            _context.Lessons.Remove(lesson);
            await _context.SaveChangesAsync();
        }

        public async Task SetLessonVideoUrlAsync(Guid lessonId, Guid courseId, string title, string? videoUrl, Guid? uploadedById = null)
        {
            var existingVideo = await _context.CourseFiles
                .FirstOrDefaultAsync(cf => cf.LessonId == lessonId && cf.FileType == Domain.Enums.CourseFileType.Video);

            if (string.IsNullOrWhiteSpace(videoUrl))
            {
                if (existingVideo != null)
                {
                    _context.CourseFiles.Remove(existingVideo);
                    await _context.SaveChangesAsync();
                }
                return;
            }

            var uploadId = uploadedById ?? (existingVideo?.UploadedById ?? Guid.Empty);
            if (uploadId == Guid.Empty)
            {
                var course = await _context.Courses.AsNoTracking().FirstOrDefaultAsync(c => c.Id == courseId);
                uploadId = course?.InstructorId ?? Guid.Empty;
                if (uploadId == Guid.Empty)
                {
                    uploadId = await _context.Users.Select(u => u.Id).FirstOrDefaultAsync();
                }
            }

            if (existingVideo != null)
            {
                existingVideo.BlobStorageUrl = videoUrl;
                existingVideo.FileName = $"{title} - Video";
                _context.CourseFiles.Update(existingVideo);
            }
            else
            {
                var newFile = new EducationalPlatform.Domain.Entities.Course_File.CourseFile
                {
                    Id = Guid.NewGuid(),
                    CourseId = courseId,
                    LessonId = lessonId,
                    FileName = $"{title} - Video",
                    FileType = Domain.Enums.CourseFileType.Video,
                    BlobStorageUrl = videoUrl,
                    FileSize = 0,
                    UploadedById = uploadId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.CourseFiles.Add(newFile);
            }
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Lesson>> GetAllAsync()
        {
            return await _context.Lessons
                .Include(l => l.CourseFiles)
                .Include(l => l.Quizzes)
                .ToListAsync();
        }

        public async Task<Lesson?> GetByIdAsync(Guid id)
        {
            var Lesson = await _context.Lessons
                .AsNoTracking()
                .Include(c => c.CourseFiles)
                .Include(c => c.Quizzes)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (Lesson == null)
                return null;

            return Lesson;
        }

        public async Task UpdateAsync(Lesson Lesson)
        {
            _context.Lessons.Update(Lesson);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Lesson>> GetAllByCourseIdAsync(Guid courseId)
        {
            return await _context.Lessons
                .Where(l => l.CourseId == courseId)
                .Include(l => l.CourseFiles)
                .Include(l => l.Quizzes)
                .ToListAsync();
        }
    }
}
