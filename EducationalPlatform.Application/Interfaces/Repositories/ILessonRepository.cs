using EducationalPlatform.Domain.Entities.Leeson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EducationalPlatform.Application.Interfaces.Repositories
{
    public interface ILessonRepository
    {
        Task<Lesson?> GetByIdAsync(Guid id);
        Task<IEnumerable<Lesson>> GetAllAsync();
        Task<IEnumerable<Lesson>> GetAllByCourseIdAsync(Guid courseId);
        Task AddAsync(Lesson Lesson);
        Task UpdateAsync(Lesson Lesson);
        Task DeleteAsync(Lesson lesson);
        Task SetLessonVideoUrlAsync(Guid lessonId, Guid courseId, string title, string? videoUrl, Guid? uploadedById = null);
    }
}
