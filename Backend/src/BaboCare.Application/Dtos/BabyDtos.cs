namespace BaboCare.Application.Dtos;

/// <summary>
/// 寶寶回應 DTO - 包含所有寶寶信息、審計欄位和頭像 URL
/// </summary>
public class BabyResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public DateOnly DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? NannyId { get; set; }
    public string? AvatarUrl { get; set; }

    // 審計欄位
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
    public string UpdatedBy { get; set; } = string.Empty;

    // 導航屬性
    public List<string> ParentIds { get; set; } = new();
}

/// <summary>
/// 建立寶寶請求 DTO - 用於 POST 請求
/// </summary>
public class CreateBabyRequestDto
{
    public string Name { get; set; } = string.Empty;
    public DateOnly DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? NannyId { get; set; }
    public List<string>? ParentIds { get; set; }
}

/// <summary>
/// 更新寶寶請求 DTO - 用於 PUT 請求
/// </summary>
public class UpdateBabyRequestDto
{
    public string Name { get; set; } = string.Empty;
    public DateOnly DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? NannyId { get; set; }
    public List<string>? ParentIds { get; set; }
}
