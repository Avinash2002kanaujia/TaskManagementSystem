using TaskManagement.Application.DTOs.Projects;

namespace TaskManagement.Application.Interfaces;

public interface IProjectService
{
    Task<ProjectResponse> CreateProjectAsync(
        int teamId,
        CreateProjectRequest request,
        int userId);

    Task<List<ProjectResponse>> GetTeamProjectsAsync(
        int teamId,
        int userId);

    Task<ProjectResponse?> GetProjectByIdAsync(
        int projectId,
        int userId);
}