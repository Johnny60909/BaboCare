namespace BaboCare.Application.Dtos.Users;

/// <summary>
/// DTO for current user profile information.
/// </summary>
public record CurrentUserDto(
    string Id,
    string UserName,
    string Email,
    string DisplayName,
    string? Gender,
    string? PhoneNumber,
    List<string> Roles
);

/// <summary>
/// DTO for updating current user's own profile.
/// </summary>
public record UpdateMyProfileRequest(
    string DisplayName,
    string? Gender,
    string? Email,
    string? PhoneNumber,
    string? NewPassword = null
);
