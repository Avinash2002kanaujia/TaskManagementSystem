using TaskStatusEnum = TaskManagement.Domain.Enums.TaskStatus;

namespace TaskManagement.Application.DTOs.Tasks;

public class UpdateTaskStatusRequest
{
    public TaskStatusEnum Status { get; set; }
}