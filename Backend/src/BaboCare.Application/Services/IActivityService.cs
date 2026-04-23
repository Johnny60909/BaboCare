using BaboCare.Application.Dtos.Activities;

namespace BaboCare.Application.Services;

/// <summary>
/// 寶寶活動服務介面
/// </summary>
public interface IActivityService
{
    /// <summary>建立一筆新活動</summary>
    Task<ActivityResponseDto> CreateActivityAsync(CreateActivityRequestDto request, CancellationToken ct = default);

    /// <summary>取得動態牆（無限滾動，依 CreatedAt DESC）</summary>
    Task<(IReadOnlyList<ActivityResponseDto> Items, int Total)> GetFeedAsync(int skip, int limit, CancellationToken ct = default);

    /// <summary>取得指定寶寶的活動清單（用於頭像轉盤）</summary>
    Task<IReadOnlyList<ActivityResponseDto>> GetBabyActivitiesAsync(string babyId, int limit, CancellationToken ct = default);

    /// <summary>取得動態牆頭像摘要（依最新活動排序）</summary>
    Task<IReadOnlyList<BabyActivitySummaryDto>> GetBabyActivitySummariesAsync(CancellationToken ct = default);
}
