using BaboCare.Application.Dtos.Users;
using BaboCare.Domain.Entities.Users;
using Microsoft.AspNetCore.Identity;

namespace BaboCare.Application.Services;

public interface ICurrentUserService
{
    Task<CurrentUserDto> GetCurrentUserAsync(string userId);
    Task<CurrentUserDto> UpdateMyProfileAsync(string userId, UpdateMyProfileRequest request);
}

public class CurrentUserService : ICurrentUserService
{
    private readonly UserManager<ApplicationUser> _userManager;

    public CurrentUserService(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<CurrentUserDto> GetCurrentUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException($"User {userId} not found");

        var roles = (await _userManager.GetRolesAsync(user)).ToList();

        return new CurrentUserDto(
            user.Id,
            user.UserName!,
            user.Email!,
            user.DisplayName ?? string.Empty,
            user.Gender,
            user.PhoneNumber,
            roles
        );
    }

    public async Task<CurrentUserDto> UpdateMyProfileAsync(string userId, UpdateMyProfileRequest request)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException($"User {userId} not found");

        // 驗證 Email 唯一性（如果更改）
        if (!string.IsNullOrEmpty(request.Email) && request.Email != user.Email)
        {
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null && existingUser.Id != userId)
                throw new InvalidOperationException("Email already in use");
        }

        // 更新用戶屬性
        user.DisplayName = request.DisplayName;
        user.Gender = request.Gender;
        if (!string.IsNullOrEmpty(request.Email))
            user.Email = request.Email;
        user.PhoneNumber = request.PhoneNumber;

        // 如果提供了新密碼，則更新密碼（無需驗證舊密碼）
        if (!string.IsNullOrEmpty(request.NewPassword))
        {
            // 生成密碼重置令牌
            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

            // 使用重置令牌重設新密碼
            var passwordResult = await _userManager.ResetPasswordAsync(user, resetToken, request.NewPassword);
            if (!passwordResult.Succeeded)
                throw new InvalidOperationException($"Failed to change password: {string.Join(", ", passwordResult.Errors.Select(e => e.Description))}");
        }

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new InvalidOperationException($"Failed to update user: {string.Join(", ", result.Errors.Select(e => e.Description))}");

        return await GetCurrentUserAsync(userId);
    }
}
