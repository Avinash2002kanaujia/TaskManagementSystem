namespace TaskManagement.Application.DTOs.Dashboard;

public class DashboardResponse
{
    public int TotalTasks { get; set; }

    public int ToDoTasks { get; set; }

    public int InProgressTasks { get; set; }

    public int TestingTasks { get; set; }

    public int DoneTasks { get; set; }

    public int OverdueTasks { get; set; }

    public int TotalSprintTasks { get; set; }

    public int CompletedSprintTasks { get; set; }

    public double SprintProgressPercentage { get; set; }
}