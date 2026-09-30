using TaskManagement.Domain.Enums;

namespace TaskManagement.Domain.Entities;

public class TeamMember
{
    public int Id { get; set; }

    public int TeamId { get; set; }

    public int UserId { get; set; }

    public TeamRole Role { get; set; } = TeamRole.Member;

    public Team Team { get; set; } = null!;

    public User User { get; set; } = null!;
}