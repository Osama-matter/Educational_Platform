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
    public class ForumPostsController : ControllerBase
    {
        private readonly IForumPostService _postService;

        public ForumPostsController(IForumPostService postService)
        {
            _postService = postService;
        }

        [HttpGet(Routes.Routes.ForumPosts.GetPostById)]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _postService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("thread/{threadId:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByThread(Guid threadId)
        {
            var result = await _postService.GetByThreadIdAsync(threadId);
            return Ok(result);
        }

        [HttpPost(Routes.Routes.ForumPosts.CreatePost)]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateForumPostDto createDto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized("User not authenticated.");

            var userId = Guid.Parse(userIdStr);
            if (string.IsNullOrWhiteSpace(createDto.Content))
                return BadRequest("Content is required.");

            if (createDto.ForumThreadId == Guid.Empty && createDto.ThreadId.HasValue)
            {
                createDto.ForumThreadId = createDto.ThreadId.Value;
            }

            if (createDto.ForumThreadId == Guid.Empty)
                return BadRequest("Thread ID is required.");

            var result = await _postService.CreateAsync(createDto, userId);
            return Ok(result);
        }

        [HttpPut(Routes.Routes.ForumPosts.UpdatePost)]
        [Authorize]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateForumPostDto updateDto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            var userId = Guid.Parse(userIdStr);
            var role = User.FindFirstValue(ClaimTypes.Role);

            var post = await _postService.GetByIdAsync(id);
            if (post == null) return NotFound();

            if (post.UserId != userId && role != "Admin") return Forbid();

            try
            {
                var result = await _postService.UpdateAsync(id, updateDto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete(Routes.Routes.ForumPosts.DeletePost)]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            var userId = Guid.Parse(userIdStr);
            var role = User.FindFirstValue(ClaimTypes.Role);

            var post = await _postService.GetByIdAsync(id);
            if (post == null) return NotFound();

            if (post.UserId != userId && role != "Admin") return Forbid();

            var result = await _postService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
