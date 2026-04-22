using BaboCare.Application.Persistence;
using BaboCare.Domain.Entities.Babies;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace BaboCare.Application.Services;

/// <summary>
/// 寶寶授權服務 - 檢查用戶對寶寶的訪問權限
/// </summary>
public class BabyAuthorizationService
{
    private readonly IAppDbContext _dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public BabyAuthorizationService(IAppDbContext dbContext, IHttpContextAccessor httpContextAccessor)
    {
        _dbContext = dbContext;
        _httpContextAccessor = httpContextAccessor;
    }

    /// <summary>
    /// 檢查當前用戶是否可以訪問指定的寶寶
    /// </summary>
    public async Task<bool> CanAccessBabyAsync(string babyId)
    {
        var userId = GetCurrentUserId();
        var userRoles = GetUserRoles();

        // SystemAdmin 可以訪問所有寶寶
        if (userRoles.Contains("SystemAdmin"))
        {
            return true;
        }

        // Nanny 只能訪問自己負責的寶寶
        if (userRoles.Contains("Nanny"))
        {
            var baby = await _dbContext.Babies.FirstOrDefaultAsync(b => b.Id == babyId);
            return baby?.NannyId == userId;
        }

        // Parent 只能訪問自己的寶寶
        if (userRoles.Contains("Parent"))
        {
            var isParent = await _dbContext.BabyParents
                .AnyAsync(bp => bp.BabyId == babyId && bp.ParentId == userId);
            return isParent;
        }

        return false;
    }

    /// <summary>
    /// 檢查當前用戶是否可以修改寶寶信息
    /// </summary>
    public async Task<bool> CanModifyBabyAsync(string babyId)
    {
        var userRoles = GetUserRoles();

        // 只有 SystemAdmin 和 Nanny 可以修改寶寶信息
        if (userRoles.Contains("SystemAdmin"))
        {
            return true;
        }

        if (userRoles.Contains("Nanny"))
        {
            var userId = GetCurrentUserId();
            var baby = await _dbContext.Babies.FirstOrDefaultAsync(b => b.Id == babyId);
            return baby?.NannyId == userId;
        }

        return false;
    }

    /// <summary>
    /// 檢查當前用戶是否可以刪除寶寶
    /// </summary>
    public bool CanDeleteBaby()
    {
        var userRoles = GetUserRoles();
        return userRoles.Contains("SystemAdmin");
    }

    /// <summary>
    /// 檢查當前用戶是否可以上傳寶寶頭像
    /// </summary>
    public async Task<bool> CanUploadAvatarAsync(string babyId)
    {
        var userRoles = GetUserRoles();

        // 只有 SystemAdmin 和該寶寶的 Nanny 可以上傳頭像
        if (userRoles.Contains("SystemAdmin"))
        {
            return true;
        }

        if (userRoles.Contains("Nanny"))
        {
            var userId = GetCurrentUserId();
            var baby = await _dbContext.Babies.FirstOrDefaultAsync(b => b.Id == babyId);
            return baby?.NannyId == userId;
        }

        return false;
    }

    private string GetCurrentUserId()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext?.User?.FindFirst("sub") is { } claim)
        {
            return claim.Value;
        }

        return string.Empty;
    }

    private List<string> GetUserRoles()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        var roles = new List<string>();

        if (httpContext?.User?.FindFirst("role") is { } claim)
        {
            roles.Add(claim.Value);
        }

        // 也可以從多個 role 聲明中收集角色
        var roleClaims = httpContext?.User?.FindAll("role");
        if (roleClaims != null)
        {
            roles.AddRange(roleClaims.Select(c => c.Value));
        }

        return roles;
    }
}
