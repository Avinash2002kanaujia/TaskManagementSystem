namespace TaskManagement.Domain.Entities;

public class User
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties

    public ICollection<TeamMember> TeamMemberships { get; set; }
        = new List<TeamMember>();

    public ICollection<TaskItem> AssignedTasks { get; set; }
        = new List<TaskItem>();
}