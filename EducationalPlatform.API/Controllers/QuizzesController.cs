using EducationalPlatform.Application.DTOs.Quiz;
using EducationalPlatform.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace EducationalPlatform.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuizzesController : ControllerBase
    {
        private readonly IQuizService _quizService;

        public QuizzesController(IQuizService quizService)
        {
            _quizService = quizService;
        }

        [HttpPost(Routes.Routes.Quizzes.CreateQuiz)]
        [Authorize(Roles = "Admin,Instructor")]
        public async Task<IActionResult> Create([FromBody] CreateQuizDto createQuizDto)
        {
            var quizId = await _quizService.CreateQuizAsync(createQuizDto);
            return Ok(quizId);
        }

        [HttpGet(Routes.Routes.Quizzes.GetAllQuizzes)]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var quizzes = await _quizService.GetQuizzesAsync();
            return Ok(quizzes);
        }

        [HttpGet(Routes.Routes.Quizzes.GetQuizById)]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid quizId)
        {
            var quiz = await _quizService.GetQuizByIdAsync(quizId);
            if (quiz == null)
            {
                return NotFound();
            }
            return Ok(quiz);
        }

        [HttpGet("lesson/{lessonId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByLessonId(Guid lessonId)
        {
            var quizzes = await _quizService.GetQuizzesAsync();
            var lessonQuizzes = quizzes.Where(q => q.LessonId == lessonId).ToList();
            return Ok(lessonQuizzes);
        }

        [HttpGet("admin/{quizId}")]
        public async Task<IActionResult> GetQuizDetailsForAdmin(Guid quizId )
        {
            var quiz = await _quizService.GetQuizDetailsForAdminAsync(quizId);
            if (quiz == null)
            {
                return NotFound();
            }
            return Ok(quiz);
        }

        [HttpPut(Routes.Routes.Quizzes.UpdateQuiz)]
        [Authorize(Roles = "Admin,Instructor")]
        public async Task<IActionResult> Update([FromRoute] Guid quizId, [FromBody] UpdateQuizDto updateQuizDto)
        {
            await _quizService.UpdateQuizAsync(quizId, updateQuizDto);
            return Ok(new { message = "Updated Successfully" });
        }

        [HttpDelete(Routes.Routes.Quizzes.DeleteQuiz)]
        [Authorize(Roles = "Admin,Instructor")]
        public async Task<IActionResult> Delete(Guid quizId)
        {
            await _quizService.DeleteQuizAsync(quizId);
            return NoContent();
        }

        [HttpPost("{quizId}/publish")]
        [Authorize(Roles = "Admin,Instructor")]
        public async Task<IActionResult> Publish(Guid quizId)
        {
            var quiz = await _quizService.GetQuizByIdAsync(quizId);
            if (quiz == null) return NotFound();

            var updateDto = new UpdateQuizDto { IsPublished = true };
            await _quizService.UpdateQuizAsync(quizId, updateDto);
            return Ok("Quiz published successfully");
        }
    }
}
