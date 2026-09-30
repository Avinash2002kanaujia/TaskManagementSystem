namespace TaskManagement.Domain.Entities;

public class SubTask
{
    public int Id { get; set; }

    public int TaskItemId { get; set; }

    public string Title { get; set; } = string.Empty;

    public bool IsCompleted { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public TaskItem TaskItem { get; set; } = null!;
}