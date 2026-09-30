namespace TaskManagement.Application.DTOs.Projects;

public class ProjectResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int TeamId { get; set; }
    public int CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}