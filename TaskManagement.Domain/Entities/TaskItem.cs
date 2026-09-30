using TaskManagement.Domain.Enums;
using TaskStatusEnum = TaskManagement.Domain.Enums.TaskStatus;

namespace TaskManagement.Domain.Entities;

public class TaskItem
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? AcceptanceCriteria { get; set; }

    public TaskPriority Priority { get; set; } = TaskPriority.Medium;

    public TaskStatusEnum Status { get; set; } = TaskStatusEnum.ToDo;

    public DateTime? DueDate { get; set; }

    public int ProjectId { get; set; }

    public int? SprintId { get; set; }

    public int? AssigneeId { get; set; }

    public int CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Project Project { get; set; } = null!;

    public Sprint? Sprint { get; set; }

    public User? Assignee { get; set; }

    public ICollection<SubTask> SubTasks { get; set; }
        = new List<SubTask>();

    public ICollection<Attachment> Attachments { get; set; }
        = new List<Attachment>();
}