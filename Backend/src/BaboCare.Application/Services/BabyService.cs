using BaboCare.Application.Dtos;
using BaboCare.Application.Persistence;
using BaboCare.Domain.Abstractions;
using BaboCare.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BaboCare.Application.Services;

/// <summary>
/// 寶寶服務實現 - 處理所有寶寶相關業務邏輯
/// </summary>
public class BabyService : IBabyService
{
    private readonly IAppDbContext _dbContext;
    private readonly BabyAuthorizationService _authorizationService;
    private readonly IFileStorageService _fileStorageService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public BabyService(
        IAppDbContext dbContext,
        BabyAuthorizationService authorizationService,
        IFileStorageService fileStorageService,
        IHttpContextAccessor httpContextAccessor)
    {
        _dbContext = dbContext;
        _authorizationService = authorizationService;
        _fileStorageService = fileStorageService;
        _httpContextAccessor = httpContextAccessor;
    }

    /// <summary>
    /// 取得所有寶寶（基於角色過濾）
    /// </summary>
    public async Task<List<BabyResponseDto>> GetAllBabiesAsync()
    {
        IQueryable<Baby> query = _dbContext.Babies.Include(b => b.Parents);

        var userRoles = GetUserRoles();
        var userId = GetCurrentUserId();

        // 根據角色過濾
        if (!userRoles.Contains("SystemAdmin"))
        {
            if (userRoles.Contains("Nanny"))
            {
                query = query.Where(b => b.NannyId == userId);
            }
            else if (userRoles.Contains("Parent"))
            {
                query = query.Where(b => b.Parents.Any(p => p.ParentId == userId));
            }
            else
            {
                return new List<BabyResponseDto>();
            }
        }

        var babies = await query.OrderBy(b => b.Name).ToListAsync();
        return babies.Select(MapToBabyResponseDto).ToList();
    }

    /// <summary>
    /// 根據 ID 取得寶寶
    /// </summary>
    public async Task<BabyResponseDto?> GetBabyByIdAsync(string babyId)
    {
        if (!await _authorizationService.CanAccessBabyAsync(babyId))
        {
            return null;
        }

        var baby = await _dbContext.Babies
            .Include(b => b.Parents)
            .FirstOrDefaultAsync(b => b.Id == babyId);

        return baby == null ? null : MapToBabyResponseDto(baby);
    }

    /// <summary>
    /// 建立新寶寶
    /// </summary>
    public async Task<BabyResponseDto> CreateBabyAsync(CreateBabyRequestDto request)
    {
        var userId = GetCurrentUserId();

        // 把空字符串轉換為 null
        var nannyId = string.IsNullOrWhiteSpace(request.NannyId) ? null : request.NannyId;

        var baby = new Baby(
            request.Name,
            request.DateOfBirth,
            request.Gender,
            nannyId,
            userId);

        _dbContext.Babies.Add(baby);

        // 添加家長關聯
        if (request.ParentIds != null && request.ParentIds.Any())
        {
            foreach (var parentId in request.ParentIds)
            {
                var babyParent = new BabyParent(baby.Id, parentId, userId);
                _dbContext.BabyParents.Add(babyParent);
            }
        }

        try
        {
            await _dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            // 記錄詳細的内層異常
            var innerException = ex.InnerException?.Message ?? "No inner exception";
            throw new InvalidOperationException($"寶寶保存失敗: {ex.Message}. 內層異常: {innerException}", ex);
        }

        return MapToBabyResponseDto(baby);
    }

    /// <summary>
    /// 更新寶寶信息
    /// </summary>
    public async Task<BabyResponseDto> UpdateBabyAsync(string babyId, UpdateBabyRequestDto request)
    {
        if (!await _authorizationService.CanModifyBabyAsync(babyId))
        {
            throw new UnauthorizedAccessException("您沒有權限修改該寶寶的信息");
        }

        var baby = await _dbContext.Babies
            .Include(b => b.Parents)
            .FirstOrDefaultAsync(b => b.Id == babyId);

        if (baby == null)
        {
            throw new KeyNotFoundException($"寶寶不存在: {babyId}");
        }

        var userId = GetCurrentUserId();

        // 把空字符串轉換為 null
        var nannyId = string.IsNullOrWhiteSpace(request.NannyId) ? null : request.NannyId;

        baby.Update(request.Name, request.DateOfBirth, request.Gender, nannyId, userId);

        // 更新家長關聯
        if (request.ParentIds != null)
        {
            var currentParentIds = baby.Parents.Select(p => p.ParentId).ToList();

            // 移除不再是家長的關聯
            var parentsToRemove = baby.Parents
                .Where(p => !request.ParentIds.Contains(p.ParentId))
                .ToList();

            foreach (var parentToRemove in parentsToRemove)
            {
                _dbContext.BabyParents.Remove(parentToRemove);
            }

            // 添加新的家長關聯
            var newParentIds = request.ParentIds
                .Where(id => !currentParentIds.Contains(id))
                .ToList();

            foreach (var newParentId in newParentIds)
            {
                var babyParent = new BabyParent(baby.Id, newParentId, userId);
                _dbContext.BabyParents.Add(babyParent);
            }
        }

        await _dbContext.SaveChangesAsync();

        return MapToBabyResponseDto(baby);
    }

    /// <summary>
    /// 刪除寶寶（僅限 SystemAdmin）
    /// </summary>
    public async Task DeleteBabyAsync(string babyId)
    {
        if (!_authorizationService.CanDeleteBaby())
        {
            throw new UnauthorizedAccessException("只有系統管理員可以刪除寶寶");
        }

        var baby = await _dbContext.Babies.FirstOrDefaultAsync(b => b.Id == babyId);
        if (baby == null)
        {
            throw new KeyNotFoundException($"寶寶不存在: {babyId}");
        }

        // 如果有頭像檔案，先刪除
        if (!string.IsNullOrEmpty(baby.AvatarUrl))
        {
            await _fileStorageService.DeleteFileAsync(baby.AvatarUrl);
        }

        _dbContext.Babies.Remove(baby);
        await _dbContext.SaveChangesAsync();
    }

    /// <summary>
    /// 上傳寶寶頭像
    /// </summary>
    public async Task<string> UploadAvatarAsync(string babyId, IFormFile avatarFile)
    {
        if (!await _authorizationService.CanUploadAvatarAsync(babyId))
        {
            throw new UnauthorizedAccessException("您沒有權限上傳該寶寶的頭像");
        }

        var baby = await _dbContext.Babies.FirstOrDefaultAsync(b => b.Id == babyId);
        if (baby == null)
        {
            throw new KeyNotFoundException($"寶寶不存在: {babyId}");
        }

        // 驗證檔案
        var validationResult = await _fileStorageService.ValidateFileAsync(avatarFile);
        if (!validationResult.IsValid)
        {
            throw new InvalidOperationException($"檔案驗證失敗: {validationResult.ErrorMessage}");
        }

        // 如果已有舊頭像，先刪除
        if (!string.IsNullOrEmpty(baby.AvatarUrl))
        {
            await _fileStorageService.DeleteFileAsync(baby.AvatarUrl);
        }

        // 上傳新頭像
        var userId = GetCurrentUserId();
        var avatarUrl = await _fileStorageService.SaveFileAsync(avatarFile, $"babies/{babyId}");

        baby.SetAvatarUrl(avatarUrl, userId);
        await _dbContext.SaveChangesAsync();

        return avatarUrl;
    }

    /// <summary>
    /// 取得按用戶角色過濾的寶寶數量
    /// </summary>
    public async Task<int> GetBabyCountByRoleAsync()
    {
        var userRoles = GetUserRoles();
        var userId = GetCurrentUserId();

        if (userRoles.Contains("SystemAdmin"))
        {
            return await _dbContext.Babies.CountAsync();
        }

        if (userRoles.Contains("Nanny"))
        {
            return await _dbContext.Babies.CountAsync(b => b.NannyId == userId);
        }

        if (userRoles.Contains("Parent"))
        {
            return await _dbContext.BabyParents.CountAsync(bp => bp.ParentId == userId);
        }

        return 0;
    }

    private BabyResponseDto MapToBabyResponseDto(Baby baby)
    {
        return new BabyResponseDto
        {
            Id = baby.Id,
            Name = baby.Name,
            DateOfBirth = baby.DateOfBirth,
            Gender = baby.Gender,
            NannyId = baby.NannyId,
            AvatarUrl = baby.AvatarUrl,
            CreatedAt = baby.CreatedAt,
            CreatedBy = baby.CreatedBy,
            UpdatedAt = baby.UpdatedAt,
            UpdatedBy = baby.UpdatedBy,
            ParentIds = baby.Parents.Select(p => p.ParentId).ToList()
        };
    }

    private string GetCurrentUserId()
    {
        var user = _httpContextAccessor?.HttpContext?.User;
        // 先查找 OpenIddict 的 "sub" 聲明，再回退到 NameIdentifier
        var userId = user?.FindFirst("sub")?.Value ??
                     user?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userId ?? throw new UnauthorizedAccessException("無法獲取當前用戶 ID");
    }

    private List<string> GetUserRoles()
    {
        var user = _httpContextAccessor?.HttpContext?.User;
        if (user == null) return new List<string>();

        return user.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
    }
}
