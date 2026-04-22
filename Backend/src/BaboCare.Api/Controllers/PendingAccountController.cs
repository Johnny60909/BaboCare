using BaboCare.Application.Dtos.PendingUsers;
using BaboCare.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace BaboCare.Api.Controllers;

/// <summary>
/// 待匹配帳號的自助申請與邀請碼啟用端點（無須驗證，公開存取）
/// </summary>
[ApiController]
[Route("api/account/pending")]
public class PendingAccountController : ControllerBase
{
    private readonly IPendingAccountService _pendingService;

    public PendingAccountController(IPendingAccountService pendingService)
    {
        _pendingService = pendingService;
    }

    /// <summary>
    /// 情境 C：家長自助申請初次登入，資料暫存至 PendingUsers
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] PendingRegisterRequest req)
    {
        try
        {
            var response = await _pendingService.RegisterAsync(req);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = $"{ex.GetType().Name}: {ex.Message}" });
        }
    }

    /// <summary>
    /// 用邀請碼啟用 PendingUser：搬移轉換為正式 ApplicationUser。
    /// 成功後回傳 UserName，前端再用此帳號呼叫 /connect/token 取得 Token。
    /// </summary>
    [HttpPost("activate")]
    public async Task<IActionResult> Activate([FromBody] PendingActivateRequest req)
    {
        try
        {
            var response = await _pendingService.ActivateAsync(req);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = $"{ex.GetType().Name}: {ex.Message}" });
        }
    }
}
