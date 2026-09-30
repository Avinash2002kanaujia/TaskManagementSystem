namespace TaskManagement.Domain.Entities;

public class Sprint
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Goal { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public bool IsActive { get; set; }

    public int ProjectId { get; set; }

    public Project Project { get; set; } = null!;

    public ICollection<TaskItem> Tasks { get; set; }
        = new List<TaskItem>();
}