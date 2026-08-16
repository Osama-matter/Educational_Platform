using Ardalis.Specification.EntityFrameworkCore;
using EducationalPlatform.Application.Interfaces.Repositories;
using EducationalPlatform.Domain.Entities;
using EducationalPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EducationalPlatform.Infrastructure.Repositories
{
    public class EnrollmentRepository : IEnrollmentRepository
    {
        private readonly ApplicationDbContext _context;

        public EnrollmentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Enrollment enrollment)
        {
            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Enrollment enrollment)
        {
            _context.Enrollments.Update(enrollment);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Enrollment enrollment)
        {
            _context.Enrollments.Remove(enrollment);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Enrollment>> GetAllAsync()
        {
            return await _context.Enrollments
                .AsNoTracking()
                .Include(e => e.Course)
                    .ThenInclude(c => c.Lessons)
                .Include(e => e.LessonProgresses)
                .ToListAsync();
        }

        public async Task<Enrollment?> GetByIdAsync(Guid id)
        {
            return await _context.Enrollments
                .AsNoTracking()
                .Include(e => e.Course)
                    .ThenInclude(c => c.Lessons)
                .Include(e => e.LessonProgresses)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<Enrollment?> GetByStudentAndCourseAsync(Guid studentId, Guid courseId)
        {
            return await _context.Enrollments
                .Include(e => e.LessonProgresses)
                .Include(e => e.Course)
                    .ThenInclude(c => c.Lessons)
                .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == courseId);
        }
    }
}
