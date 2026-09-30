using TaskManagement.Application.DTOs.Comments;

namespace TaskManagement.Application.Interfaces;

public interface ICommentService
{
    Task<CommentResponse> CreateCommentAsync(
        int taskId,
        CreateCommentRequest request,
        int userId);

    Task<List<CommentResponse>> GetTaskCommentsAsync(
        int taskId,
        int userId);
}