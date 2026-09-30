using System.ComponentModel.DataAnnotations;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.DTOs.AI;

public class CreateAiTaskRequest
{
    [Range(1, int.MaxValue)]
    public int ProjectId { get; set; }

    [Required]
    [StringLength(200, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;

    [EnumDataType(typeof(TaskPriority))]
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;

    public DateTime? DueDate { get; set; }

    [Range(1, int.MaxValue)]
    public int? SprintId { get; set; }

    [Range(1, int.MaxValue)]
    public int? AssigneeId { get; set; }
}