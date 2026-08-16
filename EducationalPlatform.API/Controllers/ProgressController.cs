using EducationalPlatform.Application.DTOs.Progress;
using EducationalPlatform.Application.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace EducationalPlatform.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProgressController : ControllerBase
    {
        private readonly IProgressService _progressService;

        public ProgressController(IProgressService progressService)
        {
            _progressService = progressService;
        }

        [HttpGet(Routes.Routes.Progress.GetAllProgress)]
        public async Task<IActionResult> GetAllProgress()
        {
            var result = await _progressService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet(Routes.Routes.Progress.GetProgressById)]
        public async Task<IActionResult> GetProgressById(Guid progressId)
        {
            try
            {
                var result = await _progressService.GetByIdAsync(progressId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpPost(Routes.Routes.Progress.CreateProgress)]
        public async Task<IActionResult> CreateProgress([FromBody] CreateLessonProgressDto createLessonProgressDto)
        {
            try
            {
                var result = await _progressService.CreateAsync(createLessonProgressDto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                var message = ex.Message ?? string.Empty;
                if (message.Contains("duplicate", StringComparison.OrdinalIgnoreCase) ||
                    message.Contains("UNIQUE", StringComparison.OrdinalIgnoreCase))
                {
                    return Conflict("Lesson progress already exists.");
                }

                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while creating progress.");
            }
        }

        [HttpPost("complete-lesson/{lessonId}")]
        public async Task<IActionResult> CompleteLesson(Guid lessonId)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid? userId = null;
            if (!string.IsNullOrEmpty(userIdString) && Guid.TryParse(userIdString, out var parsedUser))
            {
                userId = parsedUser;
            }

            try
            {
                var result = await _progressService.CompleteLessonAsync(lessonId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("course/{courseId}")]
        public async Task<IActionResult> GetCourseProgress(Guid courseId)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid? userId = null;
            if (!string.IsNullOrEmpty(userIdString) && Guid.TryParse(userIdString, out var parsedUser))
            {
                userId = parsedUser;
            }

            var result = await _progressService.GetCourseProgressAsync(courseId, userId);
            return Ok(result);
        }

        [HttpDelete(Routes.Routes.Progress.DeleteProgress)]
        public async Task<IActionResult> DeleteProgress(Guid progressId)
        {
            try
            {
                await _progressService.DeleteAsync(progressId);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}
