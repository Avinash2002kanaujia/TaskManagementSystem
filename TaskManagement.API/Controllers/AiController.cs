using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagement.Application.DTOs.AI;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AiController : ControllerBase
{
    private readonly IAiService _aiService;

    public AiController(IAiService aiService)
    {
        _aiService = aiService;
    }

    [HttpPost("generate-task")]
    public async Task<IActionResult> GenerateTask(
        [FromBody] GenerateTaskRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new
            {
                message = "Task title is required."
            });
        }

        var result = await _aiService.GenerateTaskAsync(request);

        return Ok(result);
    }

    [HttpPost("create-task")]
    public async Task<IActionResult> CreateTaskWithAi(
        [FromBody] CreateAiTaskRequest request)
    {
        var userIdClaim = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException(
                "Invalid user identity.");
        }

        var result = await _aiService.CreateTaskWithAiAsync(
            request,
            userId);

        return Ok(result);
    }
}