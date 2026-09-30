using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagement.Application.DTOs.Sprints;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SprintController : ControllerBase
{
    private readonly ISprintService _sprintService;

    public SprintController(ISprintService sprintService)
    {
        _sprintService = sprintService;
    }

    [HttpPost("project/{projectId:int}")]
    public async Task<IActionResult> CreateSprint(
        int projectId,
        [FromBody] CreateSprintRequest request)
    {
        try
        {
            var userId = GetUserId();

            var sprint = await _sprintService.CreateSprintAsync(
                projectId,
                request,
                userId);

            return CreatedAtAction(
                nameof(GetSprintById),
                new { id = sprint.Id },
                sprint);
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
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpGet("project/{projectId:int}")]
    public async Task<IActionResult> GetProjectSprints(
        int projectId)
    {
        try
        {
            var userId = GetUserId();

            var sprints = await _sprintService
                .GetProjectSprintsAsync(projectId, userId);

            return Ok(sprints);
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

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetSprintById(int id)
    {
        try
        {
            var userId = GetUserId();

            var sprint = await _sprintService
                .GetSprintByIdAsync(id, userId);

            if (sprint == null)
            {
                return NotFound(new
                {
                    message = "Sprint not found."
                });
            }

            return Ok(sprint);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
    }
    [HttpPatch("{id:int}/activate")]
    public async Task<IActionResult> ActivateSprint(int id)
    {
        try
        {
            var userId = GetUserId();

            var sprint = await _sprintService
                .ActivateSprintAsync(
                    id,
                    userId);

            if (sprint == null)
            {
                return NotFound(new
                {
                    message = "Sprint not found."
                });
            }

            return Ok(sprint);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
    }

    [HttpPatch("{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateSprint(int id)
    {
        try
        {
            var userId = GetUserId();

            var sprint = await _sprintService
                .DeactivateSprintAsync(
                    id,
                    userId);

            if (sprint == null)
            {
                return NotFound(new
                {
                    message = "Sprint not found."
                });
            }

            return Ok(sprint);
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