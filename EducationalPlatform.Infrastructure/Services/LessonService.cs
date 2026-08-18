using EducationalPlatform.Application.DTOs.Lessons;
using EducationalPlatform.Application.DTOs.Quiz;
using EducationalPlatform.Application.Interfaces.Repositories;
using EducationalPlatform.Application.Interfaces.Services;
using huzcodes.Extensions.Exceptions;
using Microsoft.AspNetCore.Http;
using OpenQA.Selenium;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EducationalPlatform.Infrastructure.Services
{
    public class LessonService(ILessonRepository lessonRepository, IEnrollmentRepository enrollmentRepository, IHttpContextAccessor httpContextAccessor) : ILessonService
    {
        private readonly ILessonRepository _lessonRepository = lessonRepository;
        private readonly IEnrollmentRepository _enrollmentRepository = enrollmentRepository;
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

        private async Task ValidateAccessAsync(Guid courseId)
        {
            var userIdStr = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr))
                throw new UnauthorizedAccessException("User is not authenticated.");

            // Check if user is Admin or Instructor of the course
            var user = _httpContextAccessor.HttpContext?.User;
            if (user != null && (user.IsInRole("Admin") || user.IsInRole("Instructor")))
            {
                return; // Admins and Instructors have access to all lessons
            }

            var userId = Guid.Parse(userIdStr);
            var enrollment = await _enrollmentRepository.GetByStudentAndCourseAsync(userId, courseId);

            if (enrollment == null || !enrollment.IsActive || !string.Equals(enrollment.PaymentStatus, "Paid", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Access denied. You must be enrolled and have completed the payment to access this lesson.");
            }
        }

        //summary
        // Creates a new lesson.
        //1- Converts the CreateLessonDto to a Lesson entity.
        //2- Calls the repository to add the new lesson to the data store.
        //3- Converts the created Lesson entity back to a LessonDto and returns it.
        //summary>
        public async Task<LessonDto> CreateAsync(CreateLessonDto request)
        {
            var OData = request.ToEntity();
            await _lessonRepository.AddAsync(OData);

            if (!string.IsNullOrWhiteSpace(request.VideoUrl))
            {
                var userIdStr = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                Guid.TryParse(userIdStr, out var currentUserId);
                await _lessonRepository.SetLessonVideoUrlAsync(OData.Id, OData.CourseId, OData.Title, request.VideoUrl, currentUserId != Guid.Empty ? currentUserId : null);
            }

            var OResultDto = new LessonDto
            {
                Id = OData.Id,
                CourseId = OData.CourseId,
                Title = OData.Title,
                Content = OData.Content,
                OrderIndex = OData.OrderIndex,
                DurationMinutes = OData.DurationMinutes,
                VideoUrl = request.VideoUrl,
                CreatedAt = OData.CreatedAt,
                UpdatedAt = OData.UpdatedAt,
                Quizzes = new List<QuizSummaryDto>()
            };
            return OResultDto;
        }

        // summary
        // Deletes a lesson by its ID.
        //1- Calls the repository to delete the Lesson entity with the specified ID from the data store.
        //2- Returns true if the deletion was successful, otherwise false.
        // summary>
        public async Task<bool> DeleteAsync(Guid id)
        {
            var OData = await _lessonRepository.GetByIdAsync(id);
            if (OData == null)
            {
                throw new NotFoundException($"Lesson with ID {id} not found.");
            }
            await _lessonRepository.DeleteAsync(OData);
            return true;
        }

        //summary
        // Retrieves all lessons.
        //1- Calls the repository to get all Lesson entities from the data store.
        //2- Converts the list of Lesson entities to a list of LessonDto and returns it.
        //summary>
        public async Task<IEnumerable<LessonDto>> GetAllAsync()
        {
            var OData = await _lessonRepository.GetAllAsync();
            if (OData == null)
            {
                throw new NotFoundException("No lessons found.");
            }
            var OResult = OData.Select(lesson => new LessonDto
            {
                Id = lesson.Id,
                CourseId = lesson.CourseId,
                Title = lesson.Title,
                Content = lesson.Content,
                OrderIndex = lesson.OrderIndex,
                DurationMinutes = lesson.DurationMinutes,
                VideoUrl = lesson.CourseFiles?.FirstOrDefault(cf => cf.FileType == Domain.Enums.CourseFileType.Video)?.BlobStorageUrl,
                CreatedAt = lesson.CreatedAt,
                UpdatedAt = lesson.UpdatedAt
            });

            return OResult;
        }

        //summary
        // Retrieves a lesson by its ID.
        //1- Calls the repository to get the Lesson entity with the specified ID from the data store.
        //2- If the lesson is not found, throws a NotFoundException.
        //3- Converts the Lesson entity to a LessonDto and returns it.
        //summary>
        public async Task<LessonDto> GetByIdAsync(Guid id)
        {
            var OData = await _lessonRepository.GetByIdAsync(id);
            if (OData == null)
            {
                throw new NotFoundException($"Lesson with ID {id} not found.");
            }

            await ValidateAccessAsync(OData.CourseId);

            var OResultDto = new LessonDto
            {
                Id = OData.Id,
                CourseId = OData.CourseId,
                Title = OData.Title,
                Content = OData.Content,
                OrderIndex = OData.OrderIndex,
                DurationMinutes = OData.DurationMinutes,
                VideoUrl = OData.CourseFiles?.FirstOrDefault(cf => cf.FileType == Domain.Enums.CourseFileType.Video)?.BlobStorageUrl,
                CreatedAt = OData.CreatedAt,
                UpdatedAt = OData.UpdatedAt,
                Quizzes = OData.Quizzes?.Select(q => new EducationalPlatform.Application.DTOs.Quiz.QuizSummaryDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    DurationMinutes = q.DurationMinutes,
                    LessonId = q.LessonId
                }).ToList() ?? new List<QuizSummaryDto>()
            };
            return OResultDto;
        }

        public async Task<IEnumerable<LessonDto>> GetAllLessonsForCourseAsync(Guid courseId)
        {
            var lessons = await _lessonRepository.GetAllByCourseIdAsync(courseId);
            return lessons.Select(lesson => new LessonDto
            {
                Id = lesson.Id,
                CourseId = lesson.CourseId,
                Title = lesson.Title,
                Content = lesson.Content,
                OrderIndex = lesson.OrderIndex,
                DurationMinutes = lesson.DurationMinutes,
                VideoUrl = lesson.CourseFiles?.FirstOrDefault(cf => cf.FileType == Domain.Enums.CourseFileType.Video)?.BlobStorageUrl,
                CreatedAt = lesson.CreatedAt,
                UpdatedAt = lesson.UpdatedAt,
                Quizzes = lesson.Quizzes?.Select(q => new EducationalPlatform.Application.DTOs.Quiz.QuizSummaryDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    DurationMinutes = q.DurationMinutes,
                    LessonId = q.LessonId
                }).ToList() ?? new List<QuizSummaryDto>()
            });
        }

        public async Task<LessonDto> UpdateAsync(Guid id, UpdateLessonDto request)
        {
            var OData = await _lessonRepository.GetByIdAsync(id);
            if (OData == null)
            {
                throw new NotFoundException($"Lesson with ID {id} not found.");
            }
            OData.Title = request.Title;
            OData.Content = request.Content;
            OData.OrderIndex = request.OrderIndex;
            OData.DurationMinutes = request.DurationMinutes;
            OData.UpdatedAt = DateTime.UtcNow;

            var userIdStr = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            Guid.TryParse(userIdStr, out var currentUserId);
            await _lessonRepository.SetLessonVideoUrlAsync(id, OData.CourseId, OData.Title, request.VideoUrl, currentUserId != Guid.Empty ? currentUserId : null);

            await _lessonRepository.UpdateAsync(OData);

            var updatedLesson = await _lessonRepository.GetByIdAsync(id) ?? OData;

            var OResultDto = new LessonDto
            {
                Id = updatedLesson.Id,
                CourseId = updatedLesson.CourseId,
                Title = updatedLesson.Title,
                Content = updatedLesson.Content,
                OrderIndex = updatedLesson.OrderIndex,
                DurationMinutes = updatedLesson.DurationMinutes,
                VideoUrl = updatedLesson.CourseFiles?.FirstOrDefault(cf => cf.FileType == Domain.Enums.CourseFileType.Video)?.BlobStorageUrl ?? request.VideoUrl,
                CreatedAt = updatedLesson.CreatedAt,
                UpdatedAt = updatedLesson.UpdatedAt,
                Quizzes = updatedLesson.Quizzes?.Select(q => new EducationalPlatform.Application.DTOs.Quiz.QuizSummaryDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    DurationMinutes = q.DurationMinutes,
                    LessonId = q.LessonId
                }).ToList() ?? new List<QuizSummaryDto>()
            };
            return OResultDto;
        }

    
    }
}
