using EducationalPlatform.Application.DTOs.CourseFile;
using EducationalPlatform.Application.Interfaces.External_services;
using EducationalPlatform.Application.Interfaces.Repositories;
using EducationalPlatform.Application.Interfaces.Services;
using EducationalPlatform.Domain.Entities.Course_File;
using EducationalPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace EducationalPlatform.Infrastructure.Services
{
    public class CourseFileService : ICourseFileService
    {
        private readonly ICourseFileRepository _fileRepository;
        private readonly ICourseRepository _courseRepository;
        private readonly ILessonRepository _lessonRepository;
        private readonly IFileStorageService _fileStorageService;

        public CourseFileService(ICourseFileRepository fileRepository, ICourseRepository courseRepository, ILessonRepository lessonRepository, IFileStorageService fileStorageService)
        {
            _fileRepository = fileRepository;
            _courseRepository = courseRepository;
            _lessonRepository = lessonRepository;
            _fileStorageService = fileStorageService;
        }

        public async Task<CourseFileDto> CreateAsync(CreateCourseFileRequest request)
        {
            if (request == null) throw new ArgumentNullException(nameof(request));

            var course = await _courseRepository.GetByIdAsync(request.CourseId);
            if (course == null) throw new ArgumentException("Invalid CourseId");

            if (request.LessonId.HasValue && request.LessonId.Value != Guid.Empty)
            {
                var lesson = await _lessonRepository.GetByIdAsync(request.LessonId.Value);
                if (lesson == null) throw new ArgumentException("Invalid LessonId");
            }

            var filePath = await _fileStorageService.SaveFileAsync(request.File, request.CourseId.ToString());

            var courseFile = new CourseFile
            {
                Id = Guid.NewGuid(),
                CourseId = request.CourseId,
                LessonId = (request.LessonId.HasValue && request.LessonId.Value != Guid.Empty) ? request.LessonId : null,
                FileName = request.File.FileName,
                FileType = GetFileType(request.File.ContentType),
                FileSize = request.File.Length,
                BlobStorageUrl = filePath,
                DurationSeconds = request.DurationSeconds,
                UploadedById = request.UploadedById,
                CreatedAt = DateTime.UtcNow
            };

            await _fileRepository.AddAsync(courseFile);

            return MapToDto(courseFile);
        }

        public async Task DeleteAsync(Guid id)
        {
            var courseFile = await _fileRepository.GetByIdAsync(id);
            if (courseFile == null) throw new ArgumentException("Course file not found");

            await _fileStorageService.DeleteFileAsync(courseFile.BlobStorageUrl);
            await _fileRepository.DeleteAsync(courseFile);
        }

        public async Task<IEnumerable<CourseFileDto>> GetAllAsync()
        {
            var courseFiles = await _fileRepository.GetAllAsync();
            return courseFiles.Select(MapToDto);
        }

        public async Task<IEnumerable<CourseFileDto>> GetByCourseIdAsync(Guid courseId)
        {
            var courseFiles = await _fileRepository.GetByCourseIdAsync(courseId);
            return courseFiles.Select(MapToDto);
        }

        public async Task<CourseFileDto> GetByIdAsync(Guid id)
        {
            var courseFile = await _fileRepository.GetByIdAsync(id);
            return courseFile == null ? null : MapToDto(courseFile);
        }

        public async Task<CourseFileDto> UpdateAsync(Guid id, UpdateCourseFileRequest request)
        {
            var courseFile = await _fileRepository.GetByIdAsync(id);
            if (courseFile == null) throw new ArgumentException("Course file not found");

            if (request.File != null)
            {
                await _fileStorageService.DeleteFileAsync(courseFile.BlobStorageUrl);
                var newFilePath = await _fileStorageService.SaveFileAsync(request.File, courseFile.CourseId.ToString());

                courseFile.FileName = request.File.FileName;
                courseFile.FileSize = request.File.Length;
                courseFile.BlobStorageUrl = newFilePath;
                courseFile.FileType = GetFileType(request.File.ContentType);
            }

            await _fileRepository.UpdateAsync(courseFile);

            return MapToDto(courseFile);
        }

        private CourseFileDto MapToDto(CourseFile courseFile)
        {
            return new CourseFileDto
            {
                Id = courseFile.Id,
                CourseId = courseFile.CourseId,
                LessonId = courseFile.LessonId,
                FileName = courseFile.FileName,
                FileType = courseFile.FileType,
                FileSize = courseFile.FileSize,
                BlobStorageUrl = courseFile.BlobStorageUrl,
                DurationSeconds = courseFile.DurationSeconds,
                UploadedById = courseFile.UploadedById,
                CreatedAt = courseFile.CreatedAt
            };
        }

        private CourseFileType GetFileType(string contentType)
        {
            if (contentType.StartsWith("video")) return CourseFileType.Video;
            if (contentType.StartsWith("image")) return CourseFileType.Image;
            if (contentType == "application/pdf") return CourseFileType.PDF;
            return CourseFileType.Other;
        }
    }
}