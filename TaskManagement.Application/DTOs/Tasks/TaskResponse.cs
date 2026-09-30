using TaskStatusEnum = TaskManagement.Domain.Enums.TaskStatus;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.DTOs.Tasks;

public class TaskResponse
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? AcceptanceCriteria { get; set; }

    public TaskPriority Priority { get; set; }

    public TaskStatusEnum Status { get; set; }

    public DateTime? DueDate { get; set; }

    public int ProjectId { get; set; }

    public int? SprintId { get; set; }

    public int? AssigneeId { get; set; }

    public int CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; }
}