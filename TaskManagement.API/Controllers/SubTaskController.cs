using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagement.Application.DTOs.SubTasks;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubTaskController : ControllerBase
{
    private readonly ISubTaskService _subTaskService;

    public SubTaskController(ISubTaskService subTaskService)
    {
        _subTaskService = subTaskService;
    }

    [HttpPost("task/{taskId:int}")]
    public async Task<IActionResult> CreateSubTask(
        int taskId,
        [FromBody] CreateSubTaskRequest request)
    {
        try
        {
            var userId = GetUserId();

            var subTask = await _subTaskService
                .CreateSubTaskAsync(
                    taskId,
                    request,
                    userId);

            return Ok(subTask);
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
    public async Task<IActionResult> GetTaskSubTasks(
        int taskId)
    {
        try
        {
            var userId = GetUserId();

            var subTasks = await _subTaskService
                .GetTaskSubTasksAsync(
                    taskId,
                    userId);

            return Ok(subTasks);
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

    [HttpPatch("{id:int}")]
    public async Task<IActionResult> UpdateSubTask(
        int id,
        [FromBody] bool isCompleted)
    {
        try
        {
            var userId = GetUserId();

            var subTask = await _subTaskService
                .UpdateSubTaskAsync(
                    id,
                    isCompleted,
                    userId);

            if (subTask == null)
            {
                return NotFound(new
                {
                    message = "Subtask not found."
                });
            }

            return Ok(subTask);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
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