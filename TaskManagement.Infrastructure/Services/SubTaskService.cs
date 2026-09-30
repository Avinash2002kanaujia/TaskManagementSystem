using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.DTOs.SubTasks;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;
using TaskManagement.Infrastructure.Data;

namespace TaskManagement.Infrastructure.Services;

public class SubTaskService : ISubTaskService
{
    private readonly ApplicationDbContext _context;

    public SubTaskService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SubTaskResponse> CreateSubTaskAsync(
        int taskId,
        CreateSubTaskRequest request,
        int userId)
    {
        var task = await _context.Tasks
            .Include(x => x.Project)
            .FirstOrDefaultAsync(x => x.Id == taskId);

        if (task == null)
        {
            throw new InvalidOperationException(
                "Task does not exist.");
        }

        // User must belong to the task project's team.
        var isMember = await _context.TeamMembers
            .AnyAsync(x =>
                x.TeamId == task.Project.TeamId &&
                x.UserId == userId);

        if (!isMember)
        {
            throw new UnauthorizedAccessException(
                "You are not a member of this project's team.");
        }

        var subTask = new SubTask
        {
            TaskItemId = taskId,
            Title = request.Title.Trim(),
            IsCompleted = false
        };

        _context.SubTasks.Add(subTask);

        await _context.SaveChangesAsync();

        return MapToResponse(subTask);
    }

    public async Task<List<SubTaskResponse>> GetTaskSubTasksAsync(
        int taskId,
        int userId)
    {
        var task = await _context.Tasks
            .Include(x => x.Project)
            .FirstOrDefaultAsync(x => x.Id == taskId);

        if (task == null)
        {
            throw new InvalidOperationException(
                "Task does not exist.");
        }

        var isMember = await _context.TeamMembers
            .AnyAsync(x =>
                x.TeamId == task.Project.TeamId &&
                x.UserId == userId);

        if (!isMember)
        {
            throw new UnauthorizedAccessException(
                "You are not a member of this project's team.");
        }

        return await _context.SubTasks
            .Where(x => x.TaskItemId == taskId)
            .Select(x => new SubTaskResponse
            {
                Id = x.Id,
                TaskItemId = x.TaskItemId,
                Title = x.Title,
                IsCompleted = x.IsCompleted,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<SubTaskResponse?> UpdateSubTaskAsync(
        int subTaskId,
        bool isCompleted,
        int userId)
    {
        var subTask = await _context.SubTasks
            .Include(x => x.TaskItem)
                .ThenInclude(x => x.Project)
            .FirstOrDefaultAsync(x => x.Id == subTaskId);

        if (subTask == null)
        {
            return null;
        }

        var isMember = await _context.TeamMembers
            .AnyAsync(x =>
                x.TeamId == subTask.TaskItem.Project.TeamId &&
                x.UserId == userId);

        if (!isMember)
        {
            throw new UnauthorizedAccessException(
                "You are not a member of this project's team.");
        }

        subTask.IsCompleted = isCompleted;

        await _context.SaveChangesAsync();

        return MapToResponse(subTask);
    }

    private static SubTaskResponse MapToResponse(
        SubTask subTask)
    {
        return new SubTaskResponse
        {
            Id = subTask.Id,
            TaskItemId = subTask.TaskItemId,
            Title = subTask.Title,
            IsCompleted = subTask.IsCompleted,
            CreatedAt = subTask.CreatedAt
        };
    }
}