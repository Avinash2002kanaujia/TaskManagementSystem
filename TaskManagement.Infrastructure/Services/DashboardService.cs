using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.DTOs.Dashboard;
using TaskManagement.Application.Interfaces;
using TaskStatusEnum = TaskManagement.Domain.Enums.TaskStatus;
using TaskManagement.Infrastructure.Data;

namespace TaskManagement.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _context;

    public DashboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardResponse> GetProjectDashboardAsync(
        int projectId,
        int userId)
    {
        // 1. Find project
        var project = await _context.Projects
            .FirstOrDefaultAsync(x => x.Id == projectId);

        if (project == null)
        {
            throw new InvalidOperationException(
                "Project does not exist.");
        }

        // 2. Check team membership
        var isMember = await _context.TeamMembers
            .AnyAsync(x =>
                x.TeamId == project.TeamId &&
                x.UserId == userId);

        if (!isMember)
        {
            throw new UnauthorizedAccessException(
                "You are not a member of this project's team.");
        }

        // 3. Get all project tasks
        var tasks = await _context.Tasks
            .Where(x => x.ProjectId == projectId)
            .ToListAsync();

        // 4. Calculate task counts
        var totalTasks = tasks.Count;

        var toDoTasks = tasks.Count(
            x => x.Status == TaskStatusEnum.ToDo);

        var inProgressTasks = tasks.Count(
            x => x.Status == TaskStatusEnum.InProgress);

        var testingTasks = tasks.Count(
            x => x.Status == TaskStatusEnum.Testing);

        var doneTasks = tasks.Count(
            x => x.Status == TaskStatusEnum.Done);

        // 5. Calculate overdue tasks
        var today = DateTime.UtcNow.Date;

        var overdueTasks = tasks.Count(
    x => x.DueDate.HasValue &&
         x.DueDate.Value.Date < today &&
         x.Status != TaskStatusEnum.Done);

        // 6. Get active sprint
        var activeSprint = await _context.Sprints
            .FirstOrDefaultAsync(x =>
                x.ProjectId == projectId &&
                x.IsActive);

        var totalSprintTasks = 0;
        var completedSprintTasks = 0;

        if (activeSprint != null)
        {
            totalSprintTasks = tasks.Count(
                x => x.SprintId == activeSprint.Id);

            completedSprintTasks = tasks.Count(
    x =>
        x.SprintId == activeSprint.Id &&
        x.Status == TaskStatusEnum.Done);
        }

        // 7. Calculate sprint progress
        var sprintProgressPercentage =
            totalSprintTasks == 0
                ? 0
                : Math.Round(
                    completedSprintTasks * 100.0 /
                    totalSprintTasks,
                    2);

        return new DashboardResponse
        {
            TotalTasks = totalTasks,
            ToDoTasks = toDoTasks,
            InProgressTasks = inProgressTasks,
            TestingTasks = testingTasks,
            DoneTasks = doneTasks,
            OverdueTasks = overdueTasks,
            TotalSprintTasks = totalSprintTasks,
            CompletedSprintTasks = completedSprintTasks,
            SprintProgressPercentage =
                sprintProgressPercentage
        };
    }
}