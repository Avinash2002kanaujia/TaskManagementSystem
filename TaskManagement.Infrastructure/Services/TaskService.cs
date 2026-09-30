using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.DTOs.Tasks;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;
using TaskStatusEnum = TaskManagement.Domain.Enums.TaskStatus;
using TaskManagement.Domain.Enums;
using TaskManagement.Infrastructure.Data;

namespace TaskManagement.Infrastructure.Services;

public class TaskService : ITaskService
{
    private readonly ApplicationDbContext _context;

    public TaskService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TaskResponse> CreateTaskAsync(
        int projectId,
        CreateTaskRequest request,
        int userId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(x => x.Id == projectId);

        if (project == null)
        {
            throw new InvalidOperationException(
                "Project does not exist.");
        }

        // User must belong to the project's team.
        var isMember = await _context.TeamMembers
            .AnyAsync(x =>
                x.TeamId == project.TeamId &&
                x.UserId == userId);

        if (!isMember)
        {
            throw new UnauthorizedAccessException(
                "You are not a member of this project's team.");
        }

        // Validate assignee if provided.
        if (request.AssigneeId.HasValue)
        {
            var assigneeIsMember = await _context.TeamMembers
                .AnyAsync(x =>
                    x.TeamId == project.TeamId &&
                    x.UserId == request.AssigneeId.Value);

            if (!assigneeIsMember)
            {
                throw new InvalidOperationException(
                    "Assignee must be a member of the project's team.");
            }
        }

        // Validate sprint if provided.
        if (request.SprintId.HasValue)
        {
            var sprintExists = await _context.Sprints
                .AnyAsync(x =>
                    x.Id == request.SprintId.Value &&
                    x.ProjectId == projectId);

            if (!sprintExists)
            {
                throw new InvalidOperationException(
                    "Sprint does not belong to this project.");
            }
        }

        var task = new TaskItem
        {
            Title = request.Title.Trim(),
            Description = request.Description?.Trim(),
            AcceptanceCriteria =
                request.AcceptanceCriteria?.Trim(),

            Priority = request.Priority,

            // New tasks always start in ToDo.
            Status = TaskStatusEnum.ToDo,

            DueDate = request.DueDate,
            ProjectId = projectId,
            SprintId = request.SprintId,
            AssigneeId = request.AssigneeId,
            CreatedBy = userId
        };

        _context.Tasks.Add(task);

        await _context.SaveChangesAsync();

        return MapToResponse(task);
    }

    public async Task<List<TaskResponse>> GetProjectTasksAsync(
        int projectId,
        int userId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(x => x.Id == projectId);

        if (project == null)
        {
            throw new InvalidOperationException(
                "Project does not exist.");
        }

        var isMember = await _context.TeamMembers
            .AnyAsync(x =>
                x.TeamId == project.TeamId &&
                x.UserId == userId);

        if (!isMember)
        {
            throw new UnauthorizedAccessException(
                "You are not a member of this project's team.");
        }

        return await _context.Tasks
            .Where(x => x.ProjectId == projectId)
            .Select(x => new TaskResponse
            {
                Id = x.Id,
                Title = x.Title,
                Description = x.Description,
                AcceptanceCriteria = x.AcceptanceCriteria,
                Priority = x.Priority,
                Status = x.Status,
                DueDate = x.DueDate,
                ProjectId = x.ProjectId,
                SprintId = x.SprintId,
                AssigneeId = x.AssigneeId,
                CreatedBy = x.CreatedBy,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<TaskResponse?> GetTaskByIdAsync(
        int taskId,
        int userId)
    {
        var task = await _context.Tasks
            .Include(x => x.Project)
            .FirstOrDefaultAsync(x => x.Id == taskId);

        if (task == null)
        {
            return null;
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

        return MapToResponse(task);
    }
    public async Task<TaskResponse?> UpdateTaskStatusAsync(
    int taskId,
    UpdateTaskStatusRequest request,
    int userId)
{
    var task = await _context.Tasks
        .Include(x => x.Project)
        .FirstOrDefaultAsync(x => x.Id == taskId);

    if (task == null)
    {
        return null;
    }

    // User must belong to the project's team.
    var isMember = await _context.TeamMembers
        .AnyAsync(x =>
            x.TeamId == task.Project.TeamId &&
            x.UserId == userId);

    if (!isMember)
    {
        throw new UnauthorizedAccessException(
            "You are not a member of this project's team.");
    }

    task.Status = request.Status;

    await _context.SaveChangesAsync();

    return MapToResponse(task);
}

    private static TaskResponse MapToResponse(TaskItem task)
    {
        return new TaskResponse
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            AcceptanceCriteria = task.AcceptanceCriteria,
            Priority = task.Priority,
            Status = task.Status,
            DueDate = task.DueDate,
            ProjectId = task.ProjectId,
            SprintId = task.SprintId,
            AssigneeId = task.AssigneeId,
            CreatedBy = task.CreatedBy,
            CreatedAt = task.CreatedAt
        };
    }
}