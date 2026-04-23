using BaboCare.Api.Models;
using BaboCare.Application.Dtos.Activities;
using BaboCare.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BaboCare.Api.Controllers;

/// <summary>
/// 寶寶活動 API 控制器
/// </summary>
[ApiController]
[Authorize]
[Route("api")]
public class ActivityController : ControllerBase
{
    private readonly IActivityService _activityService;
    private readonly IFileStorageService _fileStorageService;

    public ActivityController(IActivityService activityService, IFileStorageService fileStorageService)
    {
        _activityService = activityService;
        _fileStorageService = fileStorageService;
    }

    /// <summary>
    /// 上傳活動照片（建立活動前先呼叫此 API）
    /// POST /api/activities/photo
    /// </summary>
    [HttpPost("activities/photo")]
    public async Task<JsonResponse<string>> UploadPhoto(IFormFile? file, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return JsonResponse<string>.Fail("請選擇照片", ResponseStateEnum.Error);

        var photoUrl = await _fileStorageService.SaveFileAsync(file, "activities");
        return JsonResponse<string>.Success(photoUrl);
    }

    /// <summary>
    /// 建立新活動記錄
    /// POST /api/activities
    /// </summary>
    [HttpPost("activities")]
    public async Task<JsonResponse<ActivityResponseDto>> CreateActivity(
        [FromBody] CreateActivityRequestDto request,
        CancellationToken ct)
    {
        var result = await _activityService.CreateActivityAsync(request, ct);
        return JsonResponse<ActivityResponseDto>.Success(result);
    }

    /// <summary>
    /// 取得動態牆（無限滾動）
    /// GET /api/activities?skip=0&limit=20
    /// </summary>
    [HttpGet("activities")]
    public async Task<JsonTableResponse<ActivityResponseDto>> GetFeed(
        [FromQuery] int skip = 0,
        [FromQuery] int limit = 20,
        CancellationToken ct = default)
    {
        var (items, total) = await _activityService.GetFeedAsync(skip, limit, ct);
        return JsonTableResponse<ActivityResponseDto>.Success(items.ToList(), total);
    }

    /// <summary>
    /// 取得動態牆頭像摘要（依最新活動排序）
    /// GET /api/activities/summaries
    /// </summary>
    [HttpGet("activities/summaries")]
    public async Task<JsonResponse<IReadOnlyList<BabyActivitySummaryDto>>> GetSummaries(CancellationToken ct)
    {
        var result = await _activityService.GetBabyActivitySummariesAsync(ct);
        return JsonResponse<IReadOnlyList<BabyActivitySummaryDto>>.Success(result);
    }

    /// <summary>
    /// 取得指定寶寶的活動清單（用於頭像轉盤）
    /// GET /api/babies/{babyId}/activities?limit=20
    /// </summary>
    [HttpGet("babies/{babyId}/activities")]
    public async Task<JsonResponse<IReadOnlyList<ActivityResponseDto>>> GetBabyActivities(
        string babyId,
        [FromQuery] int limit = 20,
        CancellationToken ct = default)
    {
        var result = await _activityService.GetBabyActivitiesAsync(babyId, limit, ct);
        return JsonResponse<IReadOnlyList<ActivityResponseDto>>.Success(result);
    }
}
