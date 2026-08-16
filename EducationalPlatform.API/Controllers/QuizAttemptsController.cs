using EducationalPlatform.Application.DTOs.Answer;
using EducationalPlatform.Application.DTOs.QuizAttempt;
using EducationalPlatform.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace EducationalPlatform.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class QuizAttemptsController : ControllerBase
    {
        private readonly IQuizAttemptService _quizAttemptService;
        private readonly IAnswerService _answerService;

        public QuizAttemptsController(IQuizAttemptService quizAttemptService, IAnswerService answerService)
        {
            _quizAttemptService = quizAttemptService;
            _answerService = answerService;
        }

        [HttpPost(Routes.Routes.QuizAttempts.CreateQuizAttempt)]
        public async Task<IActionResult> Create(CreateQuizAttemptDto createQuizAttemptDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized();

            try
            {
                createQuizAttemptDto.UserId = Guid.Parse(userId);
                var quizAttemptId = await _quizAttemptService.CreateQuizAttemptAsync(createQuizAttemptDto);
                return Ok(quizAttemptId);
            }
            catch (ArgumentException ex)
            {
                if (ex.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
                {
                    return NotFound(ex.Message);
                }
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet(Routes.Routes.QuizAttempts.GetAllQuizAttempts)]
        public async Task<IActionResult> GetAll()
        {
            var quizAttempts = await _quizAttemptService.GetQuizAttemptsAsync();
            return Ok(quizAttempts);
        }

        [HttpGet("my-attempts")]
        public async Task<IActionResult> GetMyAttempts()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }
            var all = await _quizAttemptService.GetQuizAttemptsAsync();
            var userAttempts = all.Where(a => a.UserId == userId).OrderByDescending(a => a.SubmittedAt ?? a.StartedAt).ToList();
            return Ok(userAttempts);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(Guid userId)
        {
            var all = await _quizAttemptService.GetQuizAttemptsAsync();
            var userAttempts = all.Where(a => a.UserId == userId).OrderByDescending(a => a.SubmittedAt ?? a.StartedAt).ToList();
            return Ok(userAttempts);
        }

        [HttpGet(Routes.Routes.QuizAttempts.GetQuizAttemptById)]
        public async Task<IActionResult> GetById(Guid quizAttemptId)
        {
            var quizAttempt = await _quizAttemptService.GetQuizAttemptByIdAsync(quizAttemptId);
            if (quizAttempt == null)
            {
                return NotFound();
            }
            return Ok(quizAttempt);
        }

        [HttpPut(Routes.Routes.QuizAttempts.UpdateQuizAttempt)]
        public async Task<IActionResult> Update(Guid quizAttemptId, UpdateQuizAttemptDto updateQuizAttemptDto)
        {
            await _quizAttemptService.UpdateQuizAttemptAsync(quizAttemptId, updateQuizAttemptDto);
            return Ok("Updated  Successfully");
        }

        [HttpDelete(Routes.Routes.QuizAttempts.DeleteQuizAttempt)]
        public async Task<IActionResult> Delete(Guid quizAttemptId)
        {
            await _quizAttemptService.DeleteQuizAttemptAsync(quizAttemptId);
            return NoContent();
        }

        [HttpPost(Routes.Routes.QuizAttempts.SubmitAnswers)]
        public async Task<IActionResult> SubmitAnswers(Guid quizAttemptId, [FromBody] SubmitAnswersRequest request)
        {
            await _answerService.SubmitAnswersAsync(quizAttemptId, request);
            return Ok("Answers submitted successfully.");
        }
    }
}
