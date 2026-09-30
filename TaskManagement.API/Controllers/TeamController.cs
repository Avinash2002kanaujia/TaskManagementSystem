using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagement.Application.DTOs.Teams;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TeamController : ControllerBase
{
    private readonly ITeamService _teamService;

    public TeamController(ITeamService teamService)
    {
        _teamService = teamService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateTeam(
        [FromBody] CreateTeamRequest request)
    {
        var userId = GetUserId();

        var team = await _teamService.CreateTeamAsync(
            request,
            userId);

        return CreatedAtAction(
            nameof(GetTeamById),
            new { id = team.Id },
            team);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyTeams()
    {
        var userId = GetUserId();

        var teams = await _teamService.GetMyTeamsAsync(userId);

        return Ok(teams);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetTeamById(int id)
    {
        var userId = GetUserId();

        var team = await _teamService.GetTeamByIdAsync(
            id,
            userId);

        if (team == null)
        {
            return NotFound(new
            {
                message = "Team not found or you are not a member."
            });
        }

        return Ok(team);
    }

    [HttpPost("{id:int}/members")]
    public async Task<IActionResult> AddMember(
        int id,
        [FromBody] AddTeamMemberRequest request)
    {
        try
        {
            var userId = GetUserId();

            await _teamService.AddMemberAsync(
                id,
                request,
                userId);

            return Ok(new
            {
                message = "Member added successfully."
            });
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
            return Conflict(new
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