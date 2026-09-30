using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.DTOs.Projects;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;
using TaskManagement.Infrastructure.Data;

namespace TaskManagement.Infrastructure.Services;

public class ProjectService : IProjectService
{
    private readonly ApplicationDbContext _context;

    public ProjectService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ProjectResponse> CreateProjectAsync(
        int teamId,
        CreateProjectRequest request,
        int userId)
    {
        // Check whether the logged-in user belongs to the team.
        var isMember = await _context.TeamMembers
            .AnyAsync(x =>
                x.TeamId == teamId &&
                x.UserId == userId);

        if (!isMember)
        {
            throw new UnauthorizedAccessException(
                "You are not a member of this team.");
        }

        // Check that the team exists.
        var teamExists = await _context.Teams
            .AnyAsync(x => x.Id == teamId);

        if (!teamExists)
        {
            throw new InvalidOperationException(
                "Team does not exist.");
        }

        var project = new Project
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            TeamId = teamId,
            CreatedBy = userId
        };

        _context.Projects.Add(project);

        await _context.SaveChangesAsync();

        return MapToResponse(project);
    }

    public async Task<List<ProjectResponse>> GetTeamProjectsAsync(
        int teamId,
        int userId)
    {
        // Only team members can see projects.
        var isMember = await _context.TeamMembers
            .AnyAsync(x =>
                x.TeamId == teamId &&
                x.UserId == userId);

        if (!isMember)
        {
            throw new UnauthorizedAccessException(
                "You are not a member of this team.");
        }

        return await _context.Projects
            .Where(x => x.TeamId == teamId)
            .Select(x => new ProjectResponse
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                TeamId = x.TeamId,
                CreatedBy = x.CreatedBy,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<ProjectResponse?> GetProjectByIdAsync(
        int projectId,
        int userId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(x => x.Id == projectId);

        if (project == null)
        {
            return null;
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

        return MapToResponse(project);
    }

    private static ProjectResponse MapToResponse(Project project)
    {
        return new ProjectResponse
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            TeamId = project.TeamId,
            CreatedBy = project.CreatedBy,
            CreatedAt = project.CreatedAt
        };
    }
}