using BaboCare.Domain.Entities.Activities;

namespace BaboCare.Application.Dtos.Activities;

/// <summary>
/// 建立寶寶活動的請求 DTO
/// </summary>
public record CreateActivityRequestDto(
    string BabyId,
    ActivityType Type,
    string PhotoUrl,
    string? Notes,
    int? TypeOption
);

/// <summary>
/// 活動的回應 DTO（用於動態牆與轉盤）
/// </summary>
public record ActivityResponseDto(
    string Id,
    string BabyId,
    string BabyName,
    string? BabyAvatarUrl,
    ActivityType Type,
    string PhotoUrl,
    string? Notes,
    int? TypeOption,
    DateTime CreatedAt,
    string CreatedByUserId
);

/// <summary>
/// 動態牆頭像摘要（用於頂部頭像列）- 依最新活動排序
/// </summary>
public record BabyActivitySummaryDto(
    string BabyId,
    string BabyName,
    string? BabyAvatarUrl,
    DateTime LatestActivityAt,
    int ActivityCount
);
