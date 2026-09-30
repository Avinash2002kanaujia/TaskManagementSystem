namespace TaskManagement.Application.DTOs.Comments;

public class CommentResponse
{
    public string Id { get; set; } = string.Empty;

    public int TaskId { get; set; }

    public int UserId { get; set; }

    public string UserName { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}