using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagement.Application.DTOs.Comments;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CommentController : ControllerBase
{
    private readonly ICommentService _commentService;

    public CommentController(ICommentService commentService)
    {
        _commentService = commentService;
    }

    [HttpPost("task/{taskId:int}")]
    public async Task<IActionResult> CreateComment(
        int taskId,
        [FromBody] CreateCommentRequest request)
    {
        try
        {
            var userId = GetUserId();

            var comment = await _commentService
                .CreateCommentAsync(
                    taskId,
                    request,
                    userId);

            return Ok(comment);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }

    [HttpGet("task/{taskId:int}")]
    public async Task<IActionResult> GetTaskComments(
        int taskId)
    {
        try
        {
            var userId = GetUserId();

            var comments = await _commentService
                .GetTaskCommentsAsync(
                    taskId,
                    userId);

            return Ok(comments);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }

    private int GetUserId()
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!int.TryParse(userId, out var id))
        {
            throw new UnauthorizedAccessException(
                "Invalid user identity.");
        }

        return id;
    }
}