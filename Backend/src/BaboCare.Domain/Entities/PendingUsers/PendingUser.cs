namespace BaboCare.Domain.Entities.PendingUsers;

public enum PendingUserSource
{
    Google,
    Line,
    Account
}

public class PendingUser
{
    public PendingUser()
    {
        Id = Ulid.NewUlid().ToString();
        CreatedAt = DateTime.UtcNow;
    }

    public string Id { get; set; }
    public PendingUserSource Source { get; set; } = PendingUserSource.Account;
    public string? ProviderKey { get; set; }
    public string? UserName { get; set; }
    public string? Email { get; set; }
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? PhoneNumber { get; set; }
    public string? PasswordHash { get; set; }
    public string? InviteCode { get; set; }
    public DateTime? InviteCodeExpiry { get; set; }
    public int InviteCodeAttempts { get; set; } = 0;
    public DateTime CreatedAt { get; set; }
}
