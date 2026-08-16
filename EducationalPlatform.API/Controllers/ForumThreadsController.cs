using EducationalPlatform.Application.DTOs.Forum;
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
    public class ForumThreadsController : ControllerBase
    {
        private readonly IForumThreadService _threadService;
        private readonly IForumPostService _postService;

        public ForumThreadsController(IForumThreadService threadService, IForumPostService postService)
        {
            _threadService = threadService;
            _postService = postService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _threadService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("course/{courseId}")]
        public async Task<IActionResult> GetByCourse(string courseId)
        {
            var result = await _threadService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _threadService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost(Routes.Routes.ForumThreads.CreateThread)]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateForumThreadDto createDto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized("User not authenticated.");

            if (!Guid.TryParse(userIdStr, out var userId))
                return BadRequest("Invalid user identifier.");

            if (string.IsNullOrWhiteSpace(createDto.Title))
                return BadRequest("Title is required.");

            if (string.IsNullOrWhiteSpace(createDto.Description) && !string.IsNullOrWhiteSpace(createDto.Content))
            {
                createDto.Description = createDto.Content;
            }

            if (string.IsNullOrWhiteSpace(createDto.Description))
                return BadRequest("Content / Description is required.");

            var result = await _threadService.CreateAsync(createDto, userId);
            return Ok(result);
        }

        [HttpPut(Routes.Routes.ForumThreads.UpdateThread)]
        [Authorize]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateForumThreadDto updateDto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized("User not authenticated.");
            if (!Guid.TryParse(userIdStr, out var userId)) return BadRequest("Invalid user identifier.");
            var role = User.FindFirstValue(ClaimTypes.Role);

            var thread = await _threadService.GetByIdAsync(id);
            if (thread == null) return NotFound();

            if (thread.UserId != userId && role != "Admin")
                return Forbid();

            if (string.IsNullOrWhiteSpace(updateDto.Description) && !string.IsNullOrWhiteSpace(updateDto.Content))
            {
                updateDto.Description = updateDto.Content;
            }

            var result = await _threadService.UpdateAsync(id, updateDto);
            return Ok(result);
        }

        [HttpDelete(Routes.Routes.ForumThreads.DeleteThread)]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized("User not authenticated.");
            if (!Guid.TryParse(userIdStr, out var userId)) return BadRequest("Invalid user identifier.");
            var role = User.FindFirstValue(ClaimTypes.Role);

            var thread = await _threadService.GetByIdAsync(id);
            if (thread == null) return NotFound();

            if (thread.UserId != userId && role != "Admin")
                return Forbid();

            var result = await _threadService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpGet(Routes.Routes.ForumThreads.GetThreadPosts)]
        public async Task<IActionResult> GetPosts(Guid id)
        {
            var result = await _postService.GetByThreadIdAsync(id);
            return Ok(result);
        }
    }
}
