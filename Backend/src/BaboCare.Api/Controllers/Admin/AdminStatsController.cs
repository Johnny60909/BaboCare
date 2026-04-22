using BaboCare.Application.Dtos.Admin;
using BaboCare.Application.Services;
using BaboCare.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaboCare.Api.Controllers.Admin;

/// <summary>
/// 後台統計數據 API
/// </summary>
[ApiController]
[Route("api/admin/stats")]
[Authorize(Roles = "SystemAdmin,Nanny")]
public class AdminStatsController : ControllerBase
{
    private readonly IAdminUserService _userService;

    public AdminStatsController(IAdminUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// 取得後台統計數據（總用戶數、總寶寶數、待審核數）
    /// GET /api/admin/stats
    /// </summary>
    [HttpGet]
    public async Task<JsonResponse<AdminStatsDto>> GetStats()
    {
        var stats = await _userService.GetAdminStatsAsync();
        return JsonResponse<AdminStatsDto>.Success(stats);
    }
}
