using BaboCare.Application.Dtos.Users;
using BaboCare.Application.Dtos.PendingUsers;
using BaboCare.Application.Persistence;
using BaboCare.Domain.Entities.Users;
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
    private readonly ILogger<UserHelperController> _logger;

    public UserHelperController(
        IAppDbContext dbContext,
        RoleManager<ApplicationRole> roleManager,
        ILogger<UserHelperController> logger)
    {
        _dbContext = dbContext;
        _roleManager = roleManager;
        _logger = logger;
    }

    /// <summary>
    /// 取得所有保母列表（用於下拉選單）
    /// GET /api/users/nannies
    /// </summary>
    [HttpGet("nannies")]
    public async Task<ActionResult<List<object>>> GetNannies()
    {
        try
        {
            var nanny = await _roleManager.FindByNameAsync("Nanny");
            if (nanny == null)
            {
                return Ok(new List<object>());
            }

            var nannies = await _dbContext.UserRoles
                .Where(ur => ur.RoleId == nanny.Id)
                .Join(_dbContext.Users,
                    ur => ur.UserId,
                    u => u.Id,
                    (ur, u) => new
                    {
                        id = u.Id,
                        displayName = u.DisplayName ?? u.UserName,
                        userName = u.UserName
                    })
                .ToListAsync();

            return Ok(nannies);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving nannies");
            return StatusCode(500, new { message = "取得保母列表時出錯" });
        }
    }

    /// <summary>
    /// 取得所有家長列表（用於多選）
    /// GET /api/users/parents
    /// </summary>
    [HttpGet("parents")]
    public async Task<ActionResult<List<object>>> GetParents()
    {
        try
        {
            var parent = await _roleManager.FindByNameAsync("Parent");
            if (parent == null)
            {
                return Ok(new List<object>());
            }

            var parents = await _dbContext.UserRoles
                .Where(ur => ur.RoleId == parent.Id)
                .Join(_dbContext.Users,
                    ur => ur.UserId,
                    u => u.Id,
                    (ur, u) => new
                    {
                        id = u.Id,
                        displayName = u.DisplayName ?? u.UserName,
                        userName = u.UserName
                    })
                .ToListAsync();

            return Ok(parents);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving parents");
            return StatusCode(500, new { message = "取得家長列表時出錯" });
        }
    }
}
