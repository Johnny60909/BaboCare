namespace BaboCare.Application.Dtos;

/// <summary>
/// DTO for pending account registration (self-service signup).
/// </summary>
public record PendingRegisterRequest(
    string? Email,
    string? PhoneNumber,
    string? UserName,
    string Password,
    string DisplayName
);

/// <summary>
/// Response after pending account registration.
/// Contains PendingUserId to be used in activation flow.
/// </summary>
public record PendingRegisterResponse(
    string PendingUserId,
    string UserName
);

/// <summary>
/// DTO for activating a pending account with invite code.
/// </summary>
public record PendingActivateRequest(
    string? PendingUserId = null,
    string? InviteCode = null
);

/// <summary>
/// Response after pending account activation.
/// Contains UserName for login.
/// </summary>
public record PendingActivateResponse(
    string UserName
);

/// <summary>
/// DTO for pending user list (displayed in admin panel).
/// </summary>
public record PendingUserListDto(
    string Id,
    string? Email,
    string? PhoneNumber,
    string? UserName,
    string DisplayName,
    string? AvatarUrl,
    string Source,
    string? InviteCode,
    bool IsInviteCodeValid
);

/// <summary>
/// Response after generating invite code for pending user.
/// </summary>
public record GenerateInviteCodeResponse(
    string InviteCode,
    DateTime InviteCodeExpiry
);
