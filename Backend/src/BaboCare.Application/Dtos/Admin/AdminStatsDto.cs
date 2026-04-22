namespace BaboCare.Application.Dtos.Admin;

/// <summary>
/// DTO for admin dashboard statistics.
/// </summary>
public record AdminStatsDto(
    int TotalUsers,
    int TotalBabies,
    int PendingCount);
