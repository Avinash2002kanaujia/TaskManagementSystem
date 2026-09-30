using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.DTOs.Teams;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using TaskManagement.Infrastructure.Data;

namespace TaskManagement.Infrastructure.Services;

public class TeamService : ITeamService
{
    private readonly ApplicationDbContext _context;

    public TeamService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TeamResponse> CreateTeamAsync(
        CreateTeamRequest request,
        int userId)
    {
        var userExists = await _context.Users
            .AnyAsync(x => x.Id == userId);

        if (!userExists)
        {
            throw new InvalidOperationException(
                "User does not exist.");
        }

        var team = new Team
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            CreatedBy = userId
        };

        _context.Teams.Add(team);

        await _context.SaveChangesAsync();

        // Creator automatically becomes team admin.
        var membership = new TeamMember
        {
            TeamId = team.Id,
            UserId = userId,
            Role = TeamRole.Admin
        };

        _context.TeamMembers.Add(membership);

        await _context.SaveChangesAsync();

        return MapToResponse(team);
    }

    public async Task<List<TeamResponse>> GetMyTeamsAsync(
        int userId)
    {
        return await _context.TeamMembers
            .Where(x => x.UserId == userId)
            .Include(x => x.Team)
            .Select(x => new TeamResponse
            {
                Id = x.Team.Id,
                Name = x.Team.Name,
                Description = x.Team.Description,
                CreatedBy = x.Team.CreatedBy,
                CreatedAt = x.Team.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<TeamResponse?> GetTeamByIdAsync(
        int teamId,
        int userId)
    {
        var isMember = await _context.TeamMembers
            .AnyAsync(x =>
                x.TeamId == teamId &&
                x.UserId == userId);

        if (!isMember)
        {
            return null;
        }

        var team = await _context.Teams
            .FirstOrDefaultAsync(x => x.Id == teamId);

        return team == null
            ? null
            : MapToResponse(team);
    }

    public async Task AddMemberAsync(
        int teamId,
        AddTeamMemberRequest request,
        int userId)
    {
        var currentMembership = await _context.TeamMembers
            .FirstOrDefaultAsync(x =>
                x.TeamId == teamId &&
                x.UserId == userId);

        if (currentMembership == null)
        {
            throw new UnauthorizedAccessException(
                "You are not a member of this team.");
        }

        if (currentMembership.Role != TeamRole.Admin)
        {
            throw new UnauthorizedAccessException(
                "Only team admins can add members.");
        }

        var userExists = await _context.Users
            .AnyAsync(x => x.Id == request.UserId);

        if (!userExists)
        {
            throw new InvalidOperationException(
                "User to add does not exist.");
        }

        var alreadyMember = await _context.TeamMembers
            .AnyAsync(x =>
                x.TeamId == teamId &&
                x.UserId == request.UserId);

        if (alreadyMember)
        {
            throw new InvalidOperationException(
                "User is already a member of this team.");
        }

        var membership = new TeamMember
        {
            TeamId = teamId,
            UserId = request.UserId,
            Role = TeamRole.Member
        };

        _context.TeamMembers.Add(membership);

        await _context.SaveChangesAsync();
    }

    private static TeamResponse MapToResponse(Team team)
    {
        return new TeamResponse
        {
            Id = team.Id,
            Name = team.Name,
            Description = team.Description,
            CreatedBy = team.CreatedBy,
            CreatedAt = team.CreatedAt
        };
    }
}