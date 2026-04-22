using BaboCare.Application.Dtos.Admin;
using BaboCare.Application.Dtos.Users;
using BaboCare.Application.Persistence;
using BaboCare.Domain.Entities.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BaboCare.Application.Services;

public class AdminUserService : IAdminUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IAppDbContext _db;

    public AdminUserService(UserManager<ApplicationUser> userManager, IAppDbContext db)
    {
        _userManager = userManager;
        _db = db;
    }

    public async Task<AdminStatsDto> GetAdminStatsAsync()
    {
        var totalUsers = await _db.Users.CountAsync(u => !u.IsDeleted);
        var totalBabies = await _db.Babies.CountAsync();
        var pendingCount = await _db.PendingUsers.CountAsync();
        return new AdminStatsDto(totalUsers, totalBabies, pendingCount);
    }

    public async Task<List<UserListDto>> GetUsersAsync()
    {
        var users = await _db.Users
            .Where(u => !u.IsDeleted)
            .Select(u => new { u.Id, u.UserName, u.DisplayName, u.Gender, u.Email, u.PhoneNumber, u.IsActive, u.IsDeleted })
            .ToListAsync();

        var userIds = users.Select(u => u.Id).ToList();

        // 批次查詢角色（避免 N+1）
        var rolesMap = await _db.UserRoles
            .Where(ur => userIds.Contains(ur.UserId))
            .Join(_db.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => new { ur.UserId, RoleName = r.Name! })
            .ToListAsync();

        // 批次查詢登入方式（避免 N+1）
        var loginsMap = await _db.UserLogins
            .Where(ul => userIds.Contains(ul.UserId))
            .Select(ul => new { ul.UserId, ul.LoginProvider })
            .ToListAsync();

        return users.Select(u => new UserListDto(
            Id: u.Id,
            UserName: u.UserName!,
            DisplayName: u.DisplayName ?? string.Empty,
            Gender: u.Gender,
            PhoneNumber: u.PhoneNumber,
            Roles: rolesMap.Where(rm => rm.UserId == u.Id).Select(rm => rm.RoleName).ToList(),
            LoginMethods: loginsMap.Where(lm => lm.UserId == u.Id).Select(lm => lm.LoginProvider).ToList(),
            IsActive: u.IsActive,
            IsDeleted: u.IsDeleted
        )).ToList();
    }

    public async Task<UserDetailDto> GetUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException($"User {userId} not found");

        var roles = (await _userManager.GetRolesAsync(user)).ToList();
        var logins = (await _userManager.GetLoginsAsync(user)).Select(l => l.LoginProvider).ToList();

        return new UserDetailDto(
            user.Id,
            user.UserName!,
            user.DisplayName ?? string.Empty,
            user.Gender,
            user.PhoneNumber,
            roles,
            logins,
            user.IsActive,
            user.IsDeleted
        );
    }

    public async Task<UserDetailDto> CreateUserAsync(string userName, string password, string? displayName = null, string? gender = null, string? email = null, string? phoneNumber = null, List<string>? roles = null, bool isActive = true)
    {
        var user = new ApplicationUser
        {
            UserName = userName,
            Email = email,
            PhoneNumber = phoneNumber,
            DisplayName = displayName,
            Gender = gender,
            IsActive = isActive
        };

        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
            throw new InvalidOperationException($"Failed to create user: {string.Join(", ", result.Errors.Select(e => e.Description))}");

        if (roles != null && roles.Count > 0)
        {
            await _userManager.AddToRolesAsync(user, roles);
        }

        return await GetUserAsync(user.Id);
    }

    public async Task<UserDetailDto> UpdateUserAsync(string userId, string? displayName = null, string? gender = null, string? email = null, string? phoneNumber = null, bool? isActive = null, List<string>? roles = null)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException($"User {userId} not found");

        if (displayName != null) user.DisplayName = displayName;
        if (gender != null) user.Gender = gender;
        if (email != null) user.Email = email;
        if (phoneNumber != null) user.PhoneNumber = phoneNumber;
        if (isActive.HasValue) user.IsActive = isActive.Value;

        await _userManager.UpdateAsync(user);

        if (roles != null)
        {
            await AssignRoleAsync(userId, roles);
        }

        return await GetUserAsync(userId);
    }

    public async Task AssignRoleAsync(string userId, List<string> roles)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException($"User {userId} not found");

        var currentRoles = (await _userManager.GetRolesAsync(user)).ToList();

        // 移除舊角色
        if (currentRoles.Count > 0)
            await _userManager.RemoveFromRolesAsync(user, currentRoles);

        // 加入新角色
        if (roles.Count > 0)
            await _userManager.AddToRolesAsync(user, roles);
    }

    public async Task<bool> DeleteUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return false;

        user.IsDeleted = true;
        await _userManager.UpdateAsync(user);
        return true;
    }
}
