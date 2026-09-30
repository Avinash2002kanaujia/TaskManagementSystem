namespace TaskManagement.Application.DTOs.AI;

public class GenerateTaskResponse
{
    public string Description { get; set; } = string.Empty;

    public List<string> AcceptanceCriteria { get; set; }
        = new();

    public List<string> Subtasks { get; set; }
        = new();
}