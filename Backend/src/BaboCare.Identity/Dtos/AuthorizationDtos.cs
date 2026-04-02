namespace BaboCare.Identity.Dtos;

public record TokenRequest(
    string Username,
    string Password
);

public record TokenResponse(
    string AccessToken,
    string RefreshToken,
    string TokenType = "Bearer",
    int ExpiresIn = 3600
);

public record RefreshTokenRequest(
    string RefreshToken
);
