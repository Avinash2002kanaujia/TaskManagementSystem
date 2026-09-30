using System.ComponentModel.DataAnnotations;

namespace TaskManagement.Application.DTOs.Teams;

public class AddTeamMemberRequest
{
    [Range(1, int.MaxValue)]
    public int UserId { get; set; }
}