using Azure.Core;
using EducationalPlatform.Application.DTOs.Courses;
using EducationalPlatform.Application.DTOs.Lessons;
using EducationalPlatform.Application.DTOs.Quiz;
using EducationalPlatform.Application.DTOs.Review;
using EducationalPlatform.Application.Interfaces.External_services;
using EducationalPlatform.Application.Interfaces.Repositories;
using EducationalPlatform.Application.Interfaces.Services;
using EducationalPlatform.Domain.Entities.Course;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EducationalPlatform.Infrastructure.Services
{
    internal class CourseService(ICourseRepository course_Repository, IImageService imageService, IHttpContextAccessor httpContextAccessor) : ICourseService
    {
        private readonly ICourseRepository _courseRepository = course_Repository;
        private readonly IImageService _imageService = imageService;
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
        public async Task<CourseDto> CreateAsync(CreateCourseDto requestCourse)
        {
            if (requestCourse is not Application.DTOs.Courses.CreateCourseDto createCourseDto)
            {
                throw new ArgumentException("Invalid request type", nameof(requestCourse));
            }
            // Upload image and get URL
            string imageUrl = await _imageService.SaveCourseImageAsync(createCourseDto.imageFile);

            var course = new Course(createCourseDto.Title, createCourseDto.Description, createCourseDto.InstructorId, createCourseDto.EstimatedDurationHours, createCourseDto.IsActive, imageUrl, createCourseDto.Price , createCourseDto.NumberOfSections);
            await _courseRepository.AddAsync(course);

            var request = _httpContextAccessor.HttpContext.Request;
            var baseUrl = $"{request.Scheme}://{request.Host}";
            var courseDto = new CourseDto(course);
            courseDto.Image_URl = $"{baseUrl}{course.Image_URl}";

            return courseDto;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var course = await _courseRepository.GetByIdAsync(id);
            if (course == null)
            {
                return false;
            }
            // Delete associated image if exists
            try
            {
                await _imageService.DeleteCourseImageAsync(course.Image_URl);
            }
            catch
            {
                // Ignore image file deletion errors
            }

            await _courseRepository.DeleteAsync(id);
            return true;
        }

        public async Task<IEnumerable<CourseDto>> GetAllAsync()
        {
            var courses = await _courseRepository.GetAllAsync();
            if (courses == null || !courses.Any())
            {
                return Enumerable.Empty<CourseDto>();
            }
            var request = _httpContextAccessor.HttpContext.Request;
            var baseUrl = $"{request.Scheme}://{request.Host}";

            var courseDtos = courses.Select(c =>
            {
                var dto = new CourseDto(c);
                dto.Image_URl = $"{baseUrl}{c.Image_URl}";
                return dto;
            });

            return courseDtos;
        }

        public async Task<CourseDto> GetByIdAsync(Guid id)
        {
            var course = await _courseRepository.GetByIdAsync(id);
            if (course == null)
            {
                return null;
            }
            var request = _httpContextAccessor.HttpContext.Request;
            var baseUrl = $"{request.Scheme}://{request.Host}";
            var courseDto = new CourseDto(course);
            courseDto.Price = course.Price; // Ensure price is set
            if (!string.IsNullOrEmpty(course.Image_URl))
            {
                courseDto.Image_URl = $"{baseUrl}{course.Image_URl}";
            }

            if (course.Lessons != null)
            {
                courseDto.Lessons = course.Lessons.OrderBy(l => l.OrderIndex).Select(l => new LessonDetailsDto
                {
                    Id = l.Id,
                    Title = l.Title,
                    DurationMinutes = l.DurationMinutes,
                    OrderIndex = l.OrderIndex
                }).ToList();

                courseDto.Quizzes = course.Lessons.SelectMany(l => l.Quizzes).Select(q => new QuizSummaryDto
                {
                }).ToList();
            }

            if (course.Reviews != null)
            {
                courseDto.Reviews = course.Reviews.Select(r => new ReviewDto
                {
                    Id = r.Id,
                    Rate = r.Rate,
                    Comment = r.Comment,
                    UserId = r.UserId,
                    UserName = r.User?.UserName,
                    CourseId = r.CourseId,
                    InstructorReply = r.InstructorReply
                }).ToList();
            }

            if (course.CourseFiles != null)
            {
                courseDto.CourseFiles = course.CourseFiles.Select(cf => new CourseFileDto
                {
                    Id = cf.Id,
                    FileName = cf.FileName,
                    FilePath = cf.BlobStorageUrl
                }).ToList();
            }

            return courseDto;
        }

            

        public async Task<CourseDto> UpdateAsync(Guid id, UpdateCourseDto requestCourse)
        {
            if (requestCourse is not Application.DTOs.Courses.UpdateCourseDto updateCourseDto)
            {
                throw new ArgumentException("Invalid request type", nameof(requestCourse));
            }

            var course = await _courseRepository.GetByIdAsync(id);
            if (course == null)
            {
                throw new ValidationException("Course not found");
            }
            // If there's a new image, update it
            string imageUrl = await _imageService.UpdateCourseImageAsync(course.Image_URl, updateCourseDto.Image_form);

            course.Title = updateCourseDto.Title;
            course.Description = updateCourseDto.Description;
            course.EstimatedDurationHours = updateCourseDto.EstimatedDurationHours;
            course.IsActive = updateCourseDto.IsActive;
            course.Image_URl = imageUrl;
            course.UpdatedAt = DateTime.UtcNow;
            course.Price = updateCourseDto.Price;
            course.NumberOfSections = updateCourseDto.NumberOfSections;
            await _courseRepository.UpdateAsync(course);

            var request = _httpContextAccessor.HttpContext.Request;
            var baseUrl = $"{request.Scheme}://{request.Host}";
            var courseDto = new CourseDto(course);
            courseDto.Image_URl = $"{baseUrl}{course.Image_URl}";

            return courseDto;
        }


        //public async Task<TResponse> GetByIdAsync(Guid id)
        //{
        //    var ORS = new Domain.Entities.Course.Specification.ReadCourseByIdSpecification(id);
        //    var OData = await _courseRepository.GetBySpecAsync(ORS);
        //    return new Application.DTOs.Courses.CourseDto(OData) as dynamic;
        //}

        //public async  Task<TResponse> UpdateAsync(Guid id, TRequest request)
        //{
        //    var Contract   = request as Application.DTOs.Courses.UpdateCourseDto;
        //    var ORS = new Domain.Entities.Course.Specification.ReadCourseByIdSpecification(id);
        //    var OData = await _courseRepository.GetBySpecAsync(ORS);
        //    if(OData == null)
        //    {
        //        throw new ValidationException("Course not found");
        //    }

        //    OData.Title = Contract.Title;
        //    OData.Description = Contract.Description;
        //    OData.EstimatedDurationHours = Contract.EstimatedDurationHours;
        //    OData.IsActive = Contract.IsActive;
        //    OData.UpdatedAt = DateTime.UtcNow;
        //    await _courseRepository.UpdateAsync(OData);
        //    return new Application.DTOs.Courses.CourseDto(OData) as dynamic;
        //}

    }
}