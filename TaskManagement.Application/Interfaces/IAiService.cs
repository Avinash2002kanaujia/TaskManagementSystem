using TaskManagement.Application.DTOs.AI;

namespace TaskManagement.Application.Interfaces;

public interface IAiService
{
    Task<GenerateTaskResponse> GenerateTaskAsync(
        GenerateTaskRequest request);

    Task<AiTaskResponse> CreateTaskWithAiAsync(
        CreateAiTaskRequest request,
        int userId);
}