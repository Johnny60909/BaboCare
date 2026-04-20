using BaboCare.Domain.Abstractions;

namespace BaboCare.Domain.Entities;

/// <summary>
/// 寶寶與家長的關聯實體
/// </summary>
public class BabyParent : IAuditable
{
    private BabyParent() { }

    public BabyParent(string babyId, string parentId, string createdBy)
    {
        Id = Ulid.NewUlid().ToString();
        BabyId = babyId;
        ParentId = parentId;
        CreatedAt = DateTime.UtcNow;
        CreatedBy = createdBy;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = createdBy;
    }

    /// <summary>
    /// 關聯的唯一標識符
    /// </summary>
    public string Id { get; private set; }

    /// <summary>
    /// 寶寶 ID
    /// </summary>
    public string BabyId { get; private set; }

    /// <summary>
    /// 家長 ID
    /// </summary>
    public string ParentId { get; private set; }

    /// <summary>
    /// 導航屬性 - 關聯的 Baby
    /// </summary>
    public Baby? Baby { get; set; }

    /// <summary>
    /// 導航屬性 - 關聯的 ApplicationUser（家長）
    /// </summary>
    public ApplicationUser? Parent { get; set; }

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
}
