using System.Security.Claims;
using BaboCare.Application.Dtos.Users;
using BaboCare.Application.Dtos.PendingUsers;
using BaboCare.Application.Persistence;
using BaboCare.Application.Services;
using BaboCare.Domain.Entities.Users;
using BaboCare.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BaboCare.Api.Controllers;

/// <summary>
/// 用戶輔助 API - 提供下拉選單數據
/// </summary>
[ApiController]
[Route("api/users")]
[Authorize]
public class UserHelperController : ControllerBase
{
    private readonly IAppDbContext _dbContext;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<UserHelperController> _logger;

    public UserHelperController(
        IAppDbContext dbContext,
        RoleManager<ApplicationRole> roleManager,
        ICurrentUserService currentUserService,
        ILogger<UserHelperController> logger)
    {
        _dbContext = dbContext;
        _roleManager = roleManager;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// 取得所有保母列表（用於下拉選單）
    /// GET /api/users/nannies
    /// </summary>
    [HttpGet("nannies")]
    public async Task<JsonResponse<List<NannyDto>>> GetNannies()
    {
        try
        {
            var nanny = await _roleManager.FindByNameAsync("Nanny");
            if (nanny == null)
            {
                return JsonResponse<List<NannyDto>>.Success(new List<NannyDto>());
            }

            var nannies = await _dbContext.UserRoles
                .Where(ur => ur.RoleId == nanny.Id)
                .Join(_dbContext.Users,
                    ur => ur.UserId,
                    u => u.Id,
                    (ur, u) => new { ur, u })
                .Where(x => !x.u.IsDeleted && x.u.IsActive)
                .Select(x => new NannyDto(
                    x.u.Id,
                    x.u.DisplayName ?? x.u.UserName,
                    x.u.UserName
                ))
                .ToListAsync();

            return JsonResponse<List<NannyDto>>.Success(nannies);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving nannies");
            return JsonResponse<List<NannyDto>>.Fail("取得保母列表時出錯", ResponseStateEnum.Error);
        }
    }

    /// <summary>
    /// 取得所有家長列表（用於多選）
    /// GET /api/users/parents
    /// </summary>
    [HttpGet("parents")]
    public async Task<JsonResponse<List<ParentDto>>> GetParents()
    {
        try
        {
            var parent = await _roleManager.FindByNameAsync("Parent");
            if (parent == null)
            {
                return JsonResponse<List<ParentDto>>.Success(new List<ParentDto>());
            }

            var parents = await _dbContext.UserRoles
                .Where(ur => ur.RoleId == parent.Id)
                .Join(_dbContext.Users,
                    ur => ur.UserId,
                    u => u.Id,
                    (ur, u) => new { ur, u })
                .Where(x => !x.u.IsDeleted && x.u.IsActive)
                .Select(x => new ParentDto(
                    x.u.Id,
                    x.u.DisplayName ?? x.u.UserName,
                    x.u.UserName
                ))
                .ToListAsync();

            return JsonResponse<List<ParentDto>>.Success(parents);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving parents");
            return JsonResponse<List<ParentDto>>.Fail("取得家長列表時出錯", ResponseStateEnum.Error);
        }
    }

    /// <summary>
    /// 取得當前用戶的個人資料
    /// GET /api/users/me
    /// </summary>
    [HttpGet("me")]
    public async Task<JsonResponse<CurrentUserDto>> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return JsonResponse<CurrentUserDto>.Fail("無法識別用戶", ResponseStateEnum.NoPermission);

        var user = await _currentUserService.GetCurrentUserAsync(userId);
        return JsonResponse<CurrentUserDto>.Success(user);
    }

    /// <summary>
    /// 更新當前用戶的個人資料
    /// PUT /api/users/me
    /// </summary>
    [HttpPut("me")]
    public async Task<JsonResponse<CurrentUserDto>> UpdateMyProfile([FromBody] UpdateMyProfileRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return JsonResponse<CurrentUserDto>.Fail("無法識別用戶", ResponseStateEnum.NoPermission);

        var user = await _currentUserService.UpdateMyProfileAsync(userId, request);
        return JsonResponse<CurrentUserDto>.Success(user);
    }
}
