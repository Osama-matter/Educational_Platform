using EducationalPlatform.Application.Interfaces.Repositories;
using EducationalPlatform.Domain.Entities.Course;
using EducationalPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EducationalPlatform.Infrastructure.Repositories
{
    public class CourseRepository : ICourseRepository
    {
        private readonly ApplicationDbContext _context;

        public CourseRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Course?> GetByIdAsync(Guid id)
        {
            var course = await _context.Courses
                .AsNoTracking()
                .Include(c => c.Lessons)
                .Include(c => c.CourseFiles)
                .Include(c => c.Reviews)
                    .ThenInclude(r => r.User)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null)
                return null;

            course.Lessons = course.Lessons
                .OrderBy(l => l.OrderIndex)
                .ToList();

            return course;
        }


        public async Task<IEnumerable<Course>> GetAllAsync()
        {
            return await _context.Courses.ToListAsync();
        }

        public async Task AddAsync(Course course)
        {
            await _context.Courses.AddAsync(course);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Course course)
        {
            _context.Courses.Update(course);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var course = await _context.Courses
                .Include(c => c.Enrollments)
                .Include(c => c.CourseFiles)
                .Include(c => c.Reviews)
                .Include(c => c.Lessons)
                    .ThenInclude(l => l.Progresses)
                .Include(c => c.Lessons)
                    .ThenInclude(l => l.Quizzes)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course != null)
            {
                if (course.Enrollments?.Count > 0)
                {
                    _context.Enrollments.RemoveRange(course.Enrollments);
                }
                if (course.CourseFiles?.Count > 0)
                {
                    _context.CourseFiles.RemoveRange(course.CourseFiles);
                }
                if (course.Reviews?.Count > 0)
                {
                    _context.Reviews.RemoveRange(course.Reviews);
                }
                if (course.Lessons?.Count > 0)
                {
                    foreach (var lesson in course.Lessons)
                    {
                        if (lesson.Progresses?.Count > 0)
                        {
                            _context.LessonProgresses.RemoveRange(lesson.Progresses);
                        }
                        if (lesson.Quizzes?.Count > 0)
                        {
                            _context.Quizzes.RemoveRange(lesson.Quizzes);
                        }
                    }
                    _context.Lessons.RemoveRange(course.Lessons);
                }

                _context.Courses.Remove(course);
                await _context.SaveChangesAsync();
            }
        }


    }
}
