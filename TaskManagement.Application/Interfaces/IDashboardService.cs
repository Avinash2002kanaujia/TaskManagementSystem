using TaskManagement.Application.DTOs.Dashboard;

namespace TaskManagement.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardResponse> GetProjectDashboardAsync(
        int projectId,
        int userId);
}