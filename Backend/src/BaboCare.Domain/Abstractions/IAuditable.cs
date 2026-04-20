namespace BaboCare.Domain.Abstractions;

/// <summary>
/// 審計介面 - 用於追蹤實體的建立和修改
/// </summary>
public interface IAuditable
{
    /// <summary>
    /// 建立時間
    /// </summary>
    DateTime CreatedAt { get; set; }

    /// <summary>
    /// 建立者的用戶 ID
    /// </summary>
    string CreatedBy { get; set; }

    /// <summary>
    /// 最後修改時間
    /// </summary>
    DateTime UpdatedAt { get; set; }

    /// <summary>
    /// 最後修改者的用戶 ID
    /// </summary>
    string UpdatedBy { get; set; }
}
