using EducationalPlatform.Application.Interfaces.External_services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EducationalPlatform.Infrastructure.Services.External_services
{
    public class ImageService : IImageService
    {
        private readonly IWebHostEnvironment _environment;

        public ImageService(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        // ---------- Create ----------
        public async Task<string> SaveCourseImageAsync(IFormFile imageFile)
        {
            if (imageFile == null || imageFile.Length == 0)
                return "/course-images/default-course.png";

            var rootPath = _environment.WebRootPath
                ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

            var folderPath = Path.Combine(rootPath, "course-images");

            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(imageFile.FileName)}";
            var filePath = Path.Combine(folderPath, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await imageFile.CopyToAsync(stream);

            // URL only (store in DB)
            return $"/course-images/{fileName}";
        }

        // ---------- Update ----------
        public async Task<string> UpdateCourseImageAsync(string existingImageUrl, IFormFile newImageFile)
        {
            if (newImageFile == null || newImageFile.Length == 0)
                return existingImageUrl;

            if (!string.IsNullOrWhiteSpace(existingImageUrl))
                await DeleteCourseImageAsync(existingImageUrl);

            return await SaveCourseImageAsync(newImageFile);
        }

        // ---------- Delete ----------
        public async Task<bool> DeleteCourseImageAsync(string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                return true;

            var rootPath = _environment.WebRootPath
                ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

            // remove leading "/"
            var relativePath = fileName.TrimStart('/');
            var fullPath = Path.Combine(rootPath, relativePath);

            if (!File.Exists(fullPath))
                return true;

            try
            {
                File.Delete(fullPath);
                return true;
            }
            catch
            {
                return false;
            }
        }


    }

}
