using EducationalPlatform.Application.DTOs.Progress;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EducationalPlatform.Application.Interfaces.Services
{
    public interface IProgressService
    {
        Task<LessonProgressDto> CreateAsync(CreateLessonProgressDto createLessonProgress);
        Task DeleteAsync(Guid id);
        Task<IEnumerable<LessonProgressDto>> GetAllAsync();
        Task<LessonProgressDto> GetByIdAsync(Guid id);
        Task<LessonProgressDto> CompleteLessonAsync(Guid lessonId, Guid? userId = null);
        Task<CourseProgressDto> GetCourseProgressAsync(Guid courseId, Guid? userId = null);
    }
}
