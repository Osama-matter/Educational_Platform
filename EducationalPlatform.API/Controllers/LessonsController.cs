using EducationalPlatform.Application.DTOs.Lessons;
using EducationalPlatform.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EducationalPlatform.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LessonsController : ControllerBase
    {
        private readonly ILessonService _lessonService;

        public LessonsController(ILessonService lessonService)
        {
            _lessonService = lessonService;
        }

        [HttpGet(Routes.Routes.Lessons.GetAllLessons)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllLessons()
        {
            var lessons = await _lessonService.GetAllAsync();
            return Ok(lessons);
        }

        [HttpGet(Routes.Routes.Lessons.GetLessonById)]
        [AllowAnonymous]
        public async Task<IActionResult> GetLessonById(Guid lessonId)
        {
            var lesson = await _lessonService.GetByIdAsync(lessonId);
            return Ok(lesson);
        }

        [HttpPost(Routes.Routes.Lessons.CreateLesson)]
        [Authorize(Roles = "Admin,Instructor")]
        public async Task<IActionResult> CreateLesson([FromBody] CreateLessonDto createLessonDto)
        {
            var createdLesson = await _lessonService.CreateAsync(createLessonDto);
            return CreatedAtAction(nameof(GetLessonById), new { lessonId = createdLesson.Id }, createdLesson);
        }

        [HttpPut(Routes.Routes.Lessons.UpdateLesson)]
        [Authorize(Roles = "Admin,Instructor")]
        public async Task<IActionResult> UpdateLesson(Guid lessonId, [FromBody] UpdateLessonDto updateLessonDto)
        {
            var updatedLesson = await _lessonService.UpdateAsync(lessonId, updateLessonDto);
            return Ok(updatedLesson);
        }

        [HttpDelete(Routes.Routes.Lessons.DeleteLesson)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteLesson(Guid lessonId)
        {
            await _lessonService.DeleteAsync(lessonId);
            return NoContent();
        }

        [HttpGet("{lessonId}/secure-stream")]
        [Authorize]
        public async Task<IActionResult> GetSecureStreamToken(Guid lessonId)
        {
            var lesson = await _lessonService.GetByIdAsync(lessonId);
            if (lesson == null) return NotFound("Lesson not found.");

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                         ?? User.FindFirst("sub")?.Value
                         ?? "anonymous";

            var expiresAt = DateTimeOffset.UtcNow.AddMinutes(30).ToUnixTimeSeconds();
            var payloadToSign = $"{userId}:{lessonId}:{expiresAt}";

            using var hmac = new System.Security.Cryptography.HMACSHA256(System.Text.Encoding.UTF8.GetBytes("EducationalPlatform_SecureVideoSecretKey_2026_!#"));
            var hashBytes = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(payloadToSign));
            var token = Convert.ToHexString(hashBytes).ToLowerInvariant();

            return Ok(new
            {
                LessonId = lessonId,
                ExpiresAt = expiresAt,
                HashToken = token,
                SecurePlaybackUrl = lesson.VideoUrl,
                WatermarkInfo = new
                {
                    UserId = userId,
                    UserEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? User.Identity?.Name ?? "student@platform",
                    Timestamp = DateTime.UtcNow
                }
            });
        }
    }
}
