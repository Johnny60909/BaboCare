using BaboCare.Domain.Abstractions;

namespace BaboCare.Domain.Entities.Activities;

/// <summary>
/// 寶寶活動記錄 - 聚合根
/// </summary>
public class Activity : AggregateRoot, IAuditable
{
    private Activity() { }

    public Activity(
        string babyId,
        ActivityType type,
        string photoUrl,
        string? notes,
        int? typeOption,
        string createdBy)
    {
        ValidateTypeOption(type, typeOption);

        Id = Ulid.NewUlid().ToString();
        BabyId = babyId;
        Type = type;
        PhotoUrl = photoUrl;
        Notes = notes;
        TypeOption = typeOption;
        CreatedAt = DateTime.UtcNow;
        CreatedBy = createdBy;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = createdBy;
    }

    /// <summary>活動唯一識別碼（ULID）</summary>
    public string Id { get; private set; }

    /// <summary>所屬寶寶 ID</summary>
    public string BabyId { get; private set; }

    /// <summary>活動類型</summary>
    public ActivityType Type { get; private set; }

    /// <summary>活動照片 URL</summary>
    public string PhotoUrl { get; private set; }

    /// <summary>備註文字</summary>
    public string? Notes { get; private set; }

    /// <summary>類型特定選項（整數枚舉值，依 Type 解讀）</summary>
    public int? TypeOption { get; private set; }

    /// <summary>建立時間（UTC）</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>建立者 ID</summary>
    public string CreatedBy { get; set; }

    /// <summary>最後更新時間（UTC）</summary>
    public DateTime UpdatedAt { get; set; }

    /// <summary>最後更新者 ID</summary>
    public string UpdatedBy { get; set; }

    /// <summary>導航屬性 - 寶寶</summary>
    public Babies.Baby? Baby { get; private set; }

    /// <summary>驗證類型特定選項的合法性</summary>
    private static void ValidateTypeOption(ActivityType type, int? typeOption)
    {
        switch (type)
        {
            case ActivityType.Eating:
                if (typeOption.HasValue && !Enum.IsDefined(typeof(EatingOption), typeOption.Value))
                    throw new ArgumentException($"進食選項值無效: {typeOption}");
                break;
            case ActivityType.Mood:
                if (typeOption.HasValue && !Enum.IsDefined(typeof(MoodOption), typeOption.Value))
                    throw new ArgumentException($"心情選項值無效: {typeOption}");
                break;
            case ActivityType.Feeding:
            case ActivityType.Diaper:
            case ActivityType.Sleep:
                // 無特殊選項
                break;
        }
    }

    protected override Task EnsureValidStateAsync(object @event)
    {
        return Task.CompletedTask;
    }

    protected override Task WhenAsync(object @event)
    {
        return Task.CompletedTask;
    }
}
