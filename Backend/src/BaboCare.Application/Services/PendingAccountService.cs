using System.Security.Cryptography;
using BaboCare.Application.Dtos.PendingUsers;
using BaboCare.Application.Persistence;
using BaboCare.Domain.Entities.PendingUsers;
using BaboCare.Domain.Entities.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace BaboCare.Application.Services;

public class PendingAccountService : IPendingAccountService
{
    private readonly IAppDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly PasswordHasher<PendingUser> _passwordHasher;
    private readonly IConfiguration _config;

    public PendingAccountService(IAppDbContext db, UserManager<ApplicationUser> userManager, IConfiguration config)
    {
        _db = db;
        _userManager = userManager;
        _passwordHasher = new PasswordHasher<PendingUser>();
        _config = config;
    }

    public async Task<PendingRegisterResponse> RegisterAsync(PendingRegisterRequest request)
    {
        // 驗證：至少有帳號、Email 或手機號碼其中之一
        if (string.IsNullOrWhiteSpace(request.UserName) &&
            string.IsNullOrWhiteSpace(request.Email) &&
            string.IsNullOrWhiteSpace(request.PhoneNumber))
        {
            throw new InvalidOperationException("At least one of UserName, Email, or PhoneNumber must be provided");
        }

        // 驗證密碼長度
        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
        {
            throw new InvalidOperationException("Password must be at least 6 characters");
        }

        var pendingUser = new PendingUser
        {
            UserName = request.UserName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            DisplayName = request.DisplayName,
            Source = PendingUserSource.Account
        };

        // Hash 密碼
        pendingUser.PasswordHash = _passwordHasher.HashPassword(pendingUser, request.Password);

        _db.PendingUsers.Add(pendingUser);
        await _db.SaveChangesAsync();

        return new PendingRegisterResponse(pendingUser.Id, request.UserName ?? request.Email ?? request.PhoneNumber!);
    }

    public async Task<PendingActivateResponse> ActivateAsync(PendingActivateRequest request)
    {
        // 尋找 PendingUser
        PendingUser? pending = null;

        if (!string.IsNullOrWhiteSpace(request.PendingUserId))
        {
            pending = await _db.PendingUsers.FirstOrDefaultAsync(p => p.Id == request.PendingUserId);
        }

        if (pending == null)
        {
            pending = await _db.PendingUsers.FirstOrDefaultAsync(p => p.InviteCode == request.InviteCode);
        }

        if (pending == null)
        {
            throw new InvalidOperationException("Invalid invite code");
        }

        // 驗證嘗試次數（≤ 5）
        if (pending.InviteCodeAttempts >= 5)
        {
            throw new InvalidOperationException("Too many failed attempts. Please request a new invite code.");
        }

        // 驗證邀請碼過期
        if (pending.InviteCodeExpiry.HasValue && DateTime.UtcNow > pending.InviteCodeExpiry)
        {
            // 驗證失敗：增加嘗試次數
            pending.InviteCodeAttempts++;
            await _db.SaveChangesAsync();
            throw new InvalidOperationException("Invite code has expired");
        }

        // 所有驗證通過，執行搬移轉換
        using var transaction = await _db.BeginTransactionAsync();
        try
        {
            // 決定 UserName 優先順序：pending.UserName → Email → PhoneNumber → ULID
            var userName = pending.UserName ?? pending.Email ?? pending.PhoneNumber ?? Ulid.NewUlid().ToString();

            // 建立 ApplicationUser
            var user = new ApplicationUser
            {
                UserName = userName,
                Email = pending.Email,
                PhoneNumber = pending.PhoneNumber,
                DisplayName = pending.DisplayName,
                IsActive = true,
                SecurityStamp = Guid.NewGuid().ToString(),
                ConcurrencyStamp = Guid.NewGuid().ToString()
            };

            // 使用 pending 的密碼 hash
            user.PasswordHash = pending.PasswordHash;

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            // 加入預設角色 Parent
            await _userManager.AddToRoleAsync(user, "Parent");

            // 刪除 PendingUser
            _db.PendingUsers.Remove(pending);
            await _db.SaveChangesAsync();

            await transaction.CommitAsync();

            return new PendingActivateResponse(userName);
        }
        catch
        {
            await transaction.RollbackAsync();
            // 事務執行失敗：增加嘗試次數
            pending.InviteCodeAttempts++;
            await _db.SaveChangesAsync();
            throw;
        }
    }

    public async Task<List<PendingUserListDto>> GetPendingUsersAsync()
    {
        return await _db.PendingUsers
            .Select(p => new PendingUserListDto(
                p.Id,
                p.Email,
                p.PhoneNumber,
                p.UserName,
                p.DisplayName,
                p.AvatarUrl,
                p.Source.ToString(),
                p.InviteCode,
                !string.IsNullOrEmpty(p.InviteCode) && (p.InviteCodeExpiry == null || p.InviteCodeExpiry > DateTime.UtcNow)
            ))
            .ToListAsync();
    }

    public async Task<string> GenerateInviteCodeAsync(string pendingUserId)
    {
        var pending = await _db.PendingUsers.FirstOrDefaultAsync(p => p.Id == pendingUserId);
        if (pending == null)
            throw new InvalidOperationException($"PendingUser {pendingUserId} not found");

        // 產生 8 字元邀請碼
        var code = GenerateRandomCode(8);
        var expiryDays = int.Parse(_config["InviteCode:ExpiryDays"] ?? "30");

        // 重置嘗試次數
        pending.InviteCodeAttempts = 0;

        pending.InviteCode = code;
        pending.InviteCodeExpiry = DateTime.UtcNow.AddDays(expiryDays);

        await _db.SaveChangesAsync();

        return code;
    }

    public async Task RemovePendingUserAsync(string pendingUserId)
    {
        var pending = await _db.PendingUsers.FirstOrDefaultAsync(p => p.Id == pendingUserId);
        if (pending != null)
        {
            _db.PendingUsers.Remove(pending);
            await _db.SaveChangesAsync();
        }
    }

    private static string GenerateRandomCode(int length)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        return new string(Enumerable.Range(0, length)
            .Select(_ => chars[random.Next(chars.Length)])
            .ToArray());
    }
}
