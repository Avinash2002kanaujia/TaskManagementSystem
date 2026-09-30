using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using TaskManagement.Application.DTOs.Comments;
using TaskManagement.Application.Interfaces;
using TaskManagement.Infrastructure.Data;
using TaskManagement.Infrastructure.MongoDB;
using TaskManagement.Infrastructure.MongoDB.Models;

namespace TaskManagement.Infrastructure.Services;

public class CommentService : ICommentService
{
    private readonly ApplicationDbContext _context;
    private readonly MongoDbContext _mongoContext;

    public CommentService(
        ApplicationDbContext context,
        MongoDbContext mongoContext)
    {
        _context = context;
        _mongoContext = mongoContext;
    }

    public async Task<CommentResponse> CreateCommentAsync(
        int taskId,
        CreateCommentRequest request,
        int userId)
    {
        // 1. Find the task in SQL Server
        var task = await _context.Tasks
            .Include(x => x.Project)
            .FirstOrDefaultAsync(x => x.Id == taskId);

        if (task == null)
        {
            throw new InvalidOperationException(
                "Task does not exist.");
        }

        // 2. Check that the user belongs to the project team
        var isMember = await _context.TeamMembers
            .AnyAsync(x =>
                x.TeamId == task.Project.TeamId &&
                x.UserId == userId);

        if (!isMember)
        {
            throw new UnauthorizedAccessException(
                "You are not a member of this project's team.");
        }

        // 3. Get the logged-in user's name from SQL Server
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == userId);

        if (user == null)
        {
            throw new InvalidOperationException(
                "User does not exist.");
        }

        // 4. Create MongoDB document
        var comment = new CommentDocument
        {
            TaskId = taskId,
            UserId = userId,
            UserName = user.Name,
            Content = request.Content.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        // 5. Save comment to MongoDB
        await _mongoContext.Comments.InsertOneAsync(comment);

        // 6. Return API response
        return MapToResponse(comment);
    }

    public async Task<List<CommentResponse>> GetTaskCommentsAsync(
        int taskId,
        int userId)
    {
        // 1. Verify task exists in SQL Server
        var task = await _context.Tasks
            .Include(x => x.Project)
            .FirstOrDefaultAsync(x => x.Id == taskId);

        if (task == null)
        {
            throw new InvalidOperationException(
                "Task does not exist.");
        }

        // 2. Verify team membership
        var isMember = await _context.TeamMembers
            .AnyAsync(x =>
                x.TeamId == task.Project.TeamId &&
                x.UserId == userId);

        if (!isMember)
        {
            throw new UnauthorizedAccessException(
                "You are not a member of this project's team.");
        }

        // 3. Read comments from MongoDB
        var comments = await _mongoContext.Comments
            .Find(x => x.TaskId == taskId)
            .SortBy(x => x.CreatedAt)
            .ToListAsync();

        // 4. Convert MongoDB documents to API responses
        return comments
            .Select(MapToResponse)
            .ToList();
    }

    private static CommentResponse MapToResponse(
        CommentDocument comment)
    {
        return new CommentResponse
        {
            Id = comment.Id,
            TaskId = comment.TaskId,
            UserId = comment.UserId,
            UserName = comment.UserName,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt
        };
    }
}