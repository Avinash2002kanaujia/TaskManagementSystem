using TaskManagement.Application.DTOs.Sprints;

namespace TaskManagement.Application.Interfaces;

public interface ISprintService
{
    Task<SprintResponse> CreateSprintAsync(
        int projectId,
        CreateSprintRequest request,
        int userId);

    Task<List<SprintResponse>> GetProjectSprintsAsync(
        int projectId,
        int userId);

    Task<SprintResponse?> GetSprintByIdAsync(
        int sprintId,
        int userId);

    Task<SprintResponse?> ActivateSprintAsync(
        int sprintId,
        int userId);

    Task<SprintResponse?> DeactivateSprintAsync(
        int sprintId,
        int userId);
}