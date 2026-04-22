using BaboCare.Domain.Abstractions;

namespace BaboCare.Domain.Entities.Babies;

public class Baby : AggregateRoot, IAuditable
{
    private Baby() { }

    public Baby(string name, DateOnly dateOfBirth, string? gender, string? nannyId, string createdBy)
    {
        Id = Ulid.NewUlid().ToString();
        Name = name;
        DateOfBirth = dateOfBirth;
        Gender = gender;
        NannyId = nannyId;
        CreatedAt = DateTime.UtcNow;
        CreatedBy = createdBy;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = createdBy;
    }

    /// <summary>
    /// 寶寶的唯一標識符
    /// </summary>
    public string Id { get; private set; }

    /// <summary>
    /// 寶寶的名字
    /// </summary>
    public string Name { get; private set; }

    /// <summary>
    /// 寶寶的出生日期
    /// </summary>
    public DateOnly DateOfBirth { get; private set; }

    /// <summary>
    /// 寶寶的性別
    /// </summary>
    public string? Gender { get; private set; }

    /// <summary>
    /// 負責該寶寶的保母 ID（可選）
    /// </summary>
    public string? NannyId { get; private set; }

    /// <summary>
    /// 寶寶的頭像 URL
    /// </summary>
    public string? AvatarUrl { get; private set; }

    /// <summary>
    /// 審計欄位 - 建立時間
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// 審計欄位 - 建立者
    /// </summary>
    public string CreatedBy { get; set; }

    /// <summary>
    /// 審計欄位 - 更新時間
    /// </summary>
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// 審計欄位 - 更新者
    /// </summary>
    public string UpdatedBy { get; set; }

    /// <summary>
    /// 與該寶寶相關的家長
    /// </summary>
    public ICollection<BabyParent> Parents { get; private set; } = new List<BabyParent>();

    /// <summary>
    /// 更新寶寶信息
    /// </summary>
    public void Update(string name, DateOnly dateOfBirth, string? gender, string? nannyId, string updatedBy)
    {
        Name = name;
        DateOfBirth = dateOfBirth;
        Gender = gender;
        NannyId = nannyId;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;
    }

    /// <summary>
    /// 更新頭像 URL
    /// </summary>
    public void SetAvatarUrl(string? avatarUrl, string updatedBy)
    {
        AvatarUrl = avatarUrl;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;
    }

    protected override async Task EnsureValidStateAsync(object @event)
    {
        // 實現事件驗證邏輯
        await Task.CompletedTask;
    }

    protected override async Task WhenAsync(object @event)
    {
        // 實現事件處理邏輯
        await Task.CompletedTask;
    }
}
