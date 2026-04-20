using BaboCare.Application.Dtos;
using BaboCare.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaboCare.Api.Controllers;

/// <summary>
/// 寶寶 API 控制器 - 管理寶寶相關的 CRUD 操作
/// </summary>
[ApiController]
[Route("api/babies")]
[Authorize]
public class BabyController : ControllerBase
{
    private readonly IBabyService _babyService;
    private readonly BabyAuthorizationService _authorizationService;
    private readonly ILogger<BabyController> _logger;

    public BabyController(
        IBabyService babyService,
        BabyAuthorizationService authorizationService,
        ILogger<BabyController> logger)
    {
        _babyService = babyService;
        _authorizationService = authorizationService;
        _logger = logger;
    }

    /// <summary>
    /// 取得所有寶寶（基於角色過濾）
    /// GET /api/babies
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<BabyResponseDto>>> GetBabies()
    {
        try
        {
            var babies = await _babyService.GetAllBabiesAsync();
            return Ok(babies);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving babies");
            return StatusCode(500, new { message = "取得寶寶列表時出錯" });
        }
    }

    /// <summary>
    /// 取得單個寶寶詳細信息
    /// GET /api/babies/{id}
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<BabyResponseDto>> GetBaby(string id)
    {
        try
        {
            if (!await _authorizationService.CanAccessBabyAsync(id))
            {
                return Forbid();
            }

            var baby = await _babyService.GetBabyByIdAsync(id);
            if (baby == null)
            {
                return NotFound(new { message = $"寶寶不存在: {id}" });
            }

            return Ok(baby);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving baby {BabyId}", id);
            return StatusCode(500, new { message = "取得寶寶時出錯" });
        }
    }

    /// <summary>
    /// 建立新寶寶
    /// POST /api/babies
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<BabyResponseDto>> CreateBaby([FromBody] CreateBabyRequestDto request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var baby = await _babyService.CreateBabyAsync(request);
            return CreatedAtAction(nameof(GetBaby), new { id = baby.Id }, baby);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating baby");
            // 在開發環境中返回詳細的異常訊息
            var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
            var errorMessage = isDevelopment
                ? $"建立寶寶時出錯: {ex.Message}"
                : "建立寶寶時出錯";
            return StatusCode(500, new { message = errorMessage, detail = isDevelopment ? ex.StackTrace : null });
        }
    }

    /// <summary>
    /// 更新寶寶信息
    /// PUT /api/babies/{id}
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<BabyResponseDto>> UpdateBaby(string id, [FromBody] UpdateBabyRequestDto request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!await _authorizationService.CanModifyBabyAsync(id))
            {
                return Forbid();
            }

            var baby = await _babyService.UpdateBabyAsync(id, request);
            return Ok(baby);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Baby not found: {BabyId}", id);
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized modification attempt for baby: {BabyId}", id);
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating baby {BabyId}", id);
            return StatusCode(500, new { message = "更新寶寶時出錯" });
        }
    }

    /// <summary>
    /// 刪除寶寶（僅限 SystemAdmin）
    /// DELETE /api/babies/{id}
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> DeleteBaby(string id)
    {
        try
        {
            await _babyService.DeleteBabyAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Baby not found: {BabyId}", id);
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized deletion attempt for baby: {BabyId}", id);
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting baby {BabyId}", id);
            return StatusCode(500, new { message = "刪除寶寶時出錯" });
        }
    }

    /// <summary>
    /// 上傳寶寶頭像
    /// POST /api/babies/{id}/avatar
    /// </summary>
    [HttpPost("{id}/avatar")]
    public async Task<IActionResult> UploadAvatar(string id, IFormFile? file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "請提供有效的檔案" });
            }

            if (!await _authorizationService.CanUploadAvatarAsync(id))
            {
                return Forbid();
            }

            var avatarUrl = await _babyService.UploadAvatarAsync(id, file);
            return Ok(new { avatarUrl = avatarUrl, message = "頭像上傳成功" });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Baby not found: {BabyId}", id);
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized avatar upload attempt for baby: {BabyId}", id);
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid file for baby: {BabyId}", id);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading avatar for baby {BabyId}", id);
            return StatusCode(500, new { message = "上傳頭像時出錯" });
        }
    }

    /// <summary>
    /// 取得按用戶角色過濾的寶寶數量
    /// GET /api/babies/stats/count
    /// </summary>
    [HttpGet("stats/count")]
    public async Task<IActionResult> GetBabyCountByRole()
    {
        try
        {
            var count = await _babyService.GetBabyCountByRoleAsync();
            return Ok(new { count = count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting baby count");
            return StatusCode(500, new { message = "取得寶寶計數時出錯" });
        }
    }
}
