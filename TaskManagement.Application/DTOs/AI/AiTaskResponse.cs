using TaskManagement.Application.DTOs.SubTasks;
using TaskManagement.Application.DTOs.Tasks;

namespace TaskManagement.Application.DTOs.AI;

public class AiTaskResponse
{
    public TaskResponse Task { get; set; } = null!;

    public List<SubTaskResponse> Subtasks { get; set; }
        = new();
}