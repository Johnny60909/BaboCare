using BaboCare.Application.Dtos;
using Microsoft.AspNetCore.Http;

namespace BaboCare.Application.Services;

/// <summary>
/// 寶寶服務介面 - 定義 CRUD 和查詢方法
/// </summary>
public interface IBabyService
{
    /// <summary>
    /// 取得所有寶寶（會根據當前用戶角色進行過濾）
    /// </summary>
    Task<List<BabyResponseDto>> GetAllBabiesAsync();

    /// <summary>
    /// 根據 ID 取得寶寶
    /// </summary>
    Task<BabyResponseDto?> GetBabyByIdAsync(string babyId);

    /// <summary>
    /// 建立新寶寶
    /// </summary>
    Task<BabyResponseDto> CreateBabyAsync(CreateBabyRequestDto request);

    /// <summary>
    /// 更新寶寶信息
    /// </summary>
    Task<BabyResponseDto> UpdateBabyAsync(string babyId, UpdateBabyRequestDto request);

    /// <summary>
    /// 刪除寶寶（僅限 SystemAdmin）
    /// </summary>
    Task DeleteBabyAsync(string babyId);

    /// <summary>
    /// 上傳寶寶頭像
    /// </summary>
    Task<string> UploadAvatarAsync(string babyId, IFormFile avatarFile);

    /// <summary>
    /// 取得按用戶角色過濾的寶寶數量
    /// </summary>
    Task<int> GetBabyCountByRoleAsync();
}
