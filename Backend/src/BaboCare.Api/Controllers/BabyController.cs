using BaboCare.Application.Dtos.Babies;
using BaboCare.Application.Services;
using BaboCare.Api.Models;
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

    public BabyController(
        IBabyService babyService,
        BabyAuthorizationService authorizationService)
    {
        _babyService = babyService;
        _authorizationService = authorizationService;
    }

    /// <summary>
    /// 取得所有寶寶（基於角色過濾）
    /// GET /api/babies
    /// </summary>
    [HttpGet]
    public async Task<JsonResponse<List<BabyResponseDto>>> GetBabies()
    {
        var babies = await _babyService.GetAllBabiesAsync();
        return JsonResponse<List<BabyResponseDto>>.Success(babies);
    }

    /// <summary>
    /// 取得單個寶寶詳細信息
    /// GET /api/babies/{id}
    /// </summary>
    [HttpGet("{id}")]
    public async Task<JsonResponse<BabyResponseDto>> GetBaby(string id)
    {
        if (!await _authorizationService.CanAccessBabyAsync(id))
        {
            return JsonResponse<BabyResponseDto>.Fail("無權限訪問此寶寶資訊", ResponseStateEnum.NoPermission);
        }

        var baby = await _babyService.GetBabyByIdAsync(id);
        if (baby == null)
        {
            return JsonResponse<BabyResponseDto>.Fail($"寶寶不存在: {id}", ResponseStateEnum.NotFound);
        }

        return JsonResponse<BabyResponseDto>.Success(baby);
    }

    /// <summary>
    /// 建立新寶寶
    /// POST /api/babies
    /// </summary>
    [HttpPost]
    public async Task<JsonResponse<BabyResponseDto>> CreateBaby([FromBody] CreateBabyRequestDto request)
    {
        var baby = await _babyService.CreateBabyAsync(request);
        return JsonResponse<BabyResponseDto>.Success(baby);
    }

    /// <summary>
    /// 更新寶寶信息
    /// PUT /api/babies/{id}
    /// </summary>
    [HttpPut("{id}")]
    public async Task<JsonResponse<BabyResponseDto>> UpdateBaby(string id, [FromBody] UpdateBabyRequestDto request)
    {
        if (!await _authorizationService.CanModifyBabyAsync(id))
        {
            return JsonResponse<BabyResponseDto>.Fail("無權限修改此寶寶資訊", ResponseStateEnum.NoPermission);
        }

        var baby = await _babyService.UpdateBabyAsync(id, request);
        return JsonResponse<BabyResponseDto>.Success(baby);
    }

    /// <summary>
    /// 刪除寶寶（僅限 SystemAdmin）
    /// DELETE /api/babies/{id}
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<JsonResponse> DeleteBaby(string id)
    {
        await _babyService.DeleteBabyAsync(id);
        return JsonResponse.Success();
    }

    /// <summary>
    /// 上傳寶寶頭像
    /// POST /api/babies/{id}/avatar
    /// </summary>
    [HttpPost("{id}/avatar")]
    public async Task<JsonResponse<string>> UploadAvatar(string id, IFormFile? file)
    {
        if (file == null || file.Length == 0)
        {
            return JsonResponse<string>.Fail("請提供有效的檔案", ResponseStateEnum.Error);
        }

        if (!await _authorizationService.CanUploadAvatarAsync(id))
        {
            return JsonResponse<string>.Fail("無權限上傳此寶寶的頭像", ResponseStateEnum.NoPermission);
        }

        var avatarUrl = await _babyService.UploadAvatarAsync(id, file);
        return JsonResponse<string>.Success(avatarUrl);
    }

    /// <summary>
    /// 取得按用戶角色過濾的寶寶數量
    /// GET /api/babies/stats/count
    /// </summary>
    [HttpGet("stats/count")]
    public async Task<JsonResponse<int>> GetBabyCountByRole()
    {
        var count = await _babyService.GetBabyCountByRoleAsync();
        return JsonResponse<int>.Success(count);
    }
}
