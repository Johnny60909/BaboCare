namespace BaboCare.Application.Dtos.Users;

/// <summary>
/// DTO for nanny information.
/// </summary>
public record NannyDto(
    string Id,
    string DisplayName,
    string UserName
);

/// <summary>
/// DTO for parent information.
/// </summary>
public record ParentDto(
    string Id,
    string DisplayName,
    string UserName
);
