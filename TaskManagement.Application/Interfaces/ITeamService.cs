using TaskManagement.Application.DTOs.Teams;

namespace TaskManagement.Application.Interfaces;

public interface ITeamService
{
    Task<TeamResponse> CreateTeamAsync(
        CreateTeamRequest request,
        int userId);

    Task<List<TeamResponse>> GetMyTeamsAsync(
        int userId);

    Task<TeamResponse?> GetTeamByIdAsync(
        int teamId,
        int userId);

    Task AddMemberAsync(
        int teamId,
        AddTeamMemberRequest request,
        int userId);
}