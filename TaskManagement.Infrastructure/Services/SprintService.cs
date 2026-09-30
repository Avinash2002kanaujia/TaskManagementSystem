using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.DTOs.Sprints;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;
using TaskManagement.Infrastructure.Data;

namespace TaskManagement.Infrastructure.Services;

public class SprintService : ISprintService
{
    private readonly ApplicationDbContext _context;

    public SprintService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SprintResponse> CreateSprintAsync(
        int projectId,
        CreateSprintRequest request,
        int userId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(x => x.Id == projectId);

        if (project == null)
        {
            throw new InvalidOperationException(
                "Project does not exist.");
        }

        // Check whether the user belongs to the project's team.
        var isMember = await _context.TeamMembers
            .AnyAsync(x =>
                x.TeamId == project.TeamId &&
                x.UserId == userId);

        if (!isMember)
        {
            throw new UnauthorizedAccessException(
                "You are not a member of this project's team.");
        }

        if (request.EndDate <= request.StartDate)
        {
            throw new InvalidOperationException(
                "End date must be after start date.");
        }

        var sprint = new Sprint
        {
            Name = request.Name.Trim(),
            Goal = request.Goal?.Trim(),
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            IsActive = false,
            ProjectId = projectId
        };

        _context.Sprints.Add(sprint);

        await _context.SaveChangesAsync();

        return MapToResponse(sprint);
    }

    public async Task<List<SprintResponse>> GetProjectSprintsAsync(
        int projectId,
        int userId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(x => x.Id == projectId);

        if (project == null)
        {
            throw new InvalidOperationException(
                "Project does not exist.");
        }

        var isMember = await _context.TeamMembers
            .AnyAsync(x =>
                x.TeamId == project.TeamId &&
                x.UserId == userId);

        if (!isMember)
        {
            throw new UnauthorizedAccessException(
                "You are not a member of this project's team.");
        }

        return await _context.Sprints
            .Where(x => x.ProjectId == projectId)
            .Select(x => new SprintResponse
            {
                Id = x.Id,
                Name = x.Name,
                Goal = x.Goal,
                StartDate = x.StartDate,
                EndDate = x.EndDate,
                IsActive = x.IsActive,
                ProjectId = x.ProjectId
            })
            .ToListAsync();
    }

    public async Task<SprintResponse?> GetSprintByIdAsync(
        int sprintId,
        int userId)
    {
        var sprint = await _context.Sprints
            .Include(x => x.Project)
            .FirstOrDefaultAsync(x => x.Id == sprintId);

        if (sprint == null)
        {
            return null;
        }

        var isMember = await _context.TeamMembers
            .AnyAsync(x =>
                x.TeamId == sprint.Project.TeamId &&
                x.UserId == userId);

        if (!isMember)
        {
            throw new UnauthorizedAccessException(
                "You are not a member of this project's team.");
        }

        return MapToResponse(sprint);
    }
    public async Task<SprintResponse?> ActivateSprintAsync(
    int sprintId,
    int userId)
{
    var sprint = await _context.Sprints
        .Include(x => x.Project)
        .FirstOrDefaultAsync(x => x.Id == sprintId);

    if (sprint == null)
    {
        return null;
    }

    var isMember = await _context.TeamMembers
        .AnyAsync(x =>
            x.TeamId == sprint.Project.TeamId &&
            x.UserId == userId);

    if (!isMember)
    {
        throw new UnauthorizedAccessException(
            "You are not a member of this project's team.");
    }

    // Deactivate any currently active sprint
    // in the same project.
    var activeSprints = await _context.Sprints
        .Where(x =>
            x.ProjectId == sprint.ProjectId &&
            x.IsActive &&
            x.Id != sprintId)
        .ToListAsync();

    foreach (var activeSprint in activeSprints)
    {
        activeSprint.IsActive = false;
    }

    sprint.IsActive = true;

    await _context.SaveChangesAsync();

    return MapToResponse(sprint);
}

public async Task<SprintResponse?> DeactivateSprintAsync(
    int sprintId,
    int userId)
{
    var sprint = await _context.Sprints
        .Include(x => x.Project)
        .FirstOrDefaultAsync(x => x.Id == sprintId);

    if (sprint == null)
    {
        return null;
    }

    var isMember = await _context.TeamMembers
        .AnyAsync(x =>
            x.TeamId == sprint.Project.TeamId &&
            x.UserId == userId);

    if (!isMember)
    {
        throw new UnauthorizedAccessException(
            "You are not a member of this project's team.");
    }

    sprint.IsActive = false;

    await _context.SaveChangesAsync();

    return MapToResponse(sprint);
}

    private static SprintResponse MapToResponse(Sprint sprint)
    {
        return new SprintResponse
        {
            Id = sprint.Id,
            Name = sprint.Name,
            Goal = sprint.Goal,
            StartDate = sprint.StartDate,
            EndDate = sprint.EndDate,
            IsActive = sprint.IsActive,
            ProjectId = sprint.ProjectId
        };
    }
}