using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagement.Application.DTOs.Tasks;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TaskController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TaskController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpPost("project/{projectId:int}")]
    public async Task<IActionResult> CreateTask(
        int projectId,
        [FromBody] CreateTaskRequest request)
    {
        var userId = GetUserId();

        var task = await _taskService.CreateTaskAsync(
            projectId,
            request,
            userId);

        return CreatedAtAction(
            nameof(GetTaskById),
            new { id = task.Id },
            task);
    }

    [HttpGet("project/{projectId:int}")]
    public async Task<IActionResult> GetProjectTasks(
        int projectId)
    {
        var userId = GetUserId();

        var tasks = await _taskService
            .GetProjectTasksAsync(projectId, userId);

        return Ok(tasks);
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateTaskStatus(
        int id,
        [FromBody] UpdateTaskStatusRequest request)
    {
        var userId = GetUserId();

        var task = await _taskService.UpdateTaskStatusAsync(
            id,
            request,
            userId);

        if (task == null)
        {
            return NotFound(new
            {
                message = "Task not found."
            });
        }

        return Ok(task);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetTaskById(int id)
    {
        var userId = GetUserId();

        var task = await _taskService
            .GetTaskByIdAsync(id, userId);

        if (task == null)
        {
            return NotFound(new
            {
                message = "Task not found."
            });
        }

        return Ok(task);
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