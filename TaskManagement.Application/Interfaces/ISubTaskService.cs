using TaskManagement.Application.DTOs.SubTasks;

namespace TaskManagement.Application.Interfaces;

public interface ISubTaskService
{
    Task<SubTaskResponse> CreateSubTaskAsync(
        int taskId,
        CreateSubTaskRequest request,
        int userId);

    Task<List<SubTaskResponse>> GetTaskSubTasksAsync(
        int taskId,
        int userId);

    Task<SubTaskResponse?> UpdateSubTaskAsync(
        int subTaskId,
        bool isCompleted,
        int userId);
}