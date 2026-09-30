using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagement.Application.DTOs.Projects;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpPost("team/{teamId:int}")]
    public async Task<IActionResult> CreateProject(
        int teamId,
        [FromBody] CreateProjectRequest request)
    {
        try
        {
            var userId = GetUserId();

            var project = await _projectService.CreateProjectAsync(
                teamId,
                request,
                userId);

            return CreatedAtAction(
                nameof(GetProjectById),
                new { id = project.Id },
                project);
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

    [HttpGet("team/{teamId:int}")]
    public async Task<IActionResult> GetTeamProjects(int teamId)
    {
        try
        {
            var userId = GetUserId();

            var projects = await _projectService
                .GetTeamProjectsAsync(teamId, userId);

            return Ok(projects);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetProjectById(int id)
    {
        try
        {
            var userId = GetUserId();

            var project = await _projectService
                .GetProjectByIdAsync(id, userId);

            if (project == null)
            {
                return NotFound(new
                {
                    message = "Project not found."
                });
            }

            return Ok(project);
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