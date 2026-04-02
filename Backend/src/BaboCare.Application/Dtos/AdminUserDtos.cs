namespace BaboCare.Application.Dtos;

/// <summary>
/// DTO for creating a user account (Admin operation).
/// </summary>
public record CreateUserRequest(
    string DisplayName,
    string? Gender,
    string? PhoneNumber,
    string? Email,
    string? UserName,
    string Password,
    List<string>? Roles = null,
    bool IsActive = true
);

/// <summary>
/// DTO for updating a user account.
/// </summary>
public record UpdateUserRequest(
    string DisplayName,
    string? Gender,
    string? PhoneNumber,
    string? Email,
    List<string>? Roles = null,
    bool? IsActive = null
);

/// <summary>
/// DTO for user list retrieval.
/// </summary>
public record UserListDto(
    string Id,
    string UserName,
    string DisplayName,
    string? Gender,
    string? PhoneNumber,
    List<string> Roles,
    List<string> LoginMethods,
    bool IsActive,
    bool IsDeleted
);

/// <summary>
/// DTO for user detail retrieval.
/// </summary>
public record UserDetailDto(
    string Id,
    string UserName,
    string DisplayName,
    string? Gender,
    string? PhoneNumber,
    List<string> Roles,
    List<string> LoginMethods,
    bool IsActive,
    bool IsDeleted
);
