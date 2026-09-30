using TaskManagement.Application.DTOs.Tasks;

namespace TaskManagement.Application.Interfaces;

public interface ITaskService
{
    Task<TaskResponse> CreateTaskAsync(
        int projectId,
        CreateTaskRequest request,
        int userId);

    Task<List<TaskResponse>> GetProjectTasksAsync(
        int projectId,
        int userId);

    Task<TaskResponse?> GetTaskByIdAsync(
        int taskId,
        int userId);

    Task<TaskResponse?> UpdateTaskStatusAsync(
    int taskId,
    UpdateTaskStatusRequest request,
    int userId);
}