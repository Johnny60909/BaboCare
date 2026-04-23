using BaboCare.Application.Dtos.Activities;
using BaboCare.Application.Persistence;
using BaboCare.Domain.Entities.Activities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BaboCare.Application.Services;

/// <summary>
/// 寶寶活動服務實作
/// </summary>
public class ActivityService : IActivityService
{
    private readonly IAppDbContext _dbContext;
    private readonly BabyAuthorizationService _authorizationService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ActivityService(
        IAppDbContext dbContext,
        BabyAuthorizationService authorizationService,
        IHttpContextAccessor httpContextAccessor)
    {
        _dbContext = dbContext;
        _authorizationService = authorizationService;
        _httpContextAccessor = httpContextAccessor;
    }

    /// <inheritdoc />
    public async Task<ActivityResponseDto> CreateActivityAsync(CreateActivityRequestDto request, CancellationToken ct = default)
    {
        if (!await _authorizationService.CanAccessBabyAsync(request.BabyId))
            throw new UnauthorizedAccessException("您沒有權限為此寶寶建立活動記錄");

        var userId = GetCurrentUserId();

        var activity = new Activity(
            request.BabyId,
            request.Type,
            request.PhotoUrl,
            request.Notes,
            request.TypeOption,
            userId);

        _dbContext.Activities.Add(activity);
        await _dbContext.SaveChangesAsync(ct);

        var baby = await _dbContext.Babies
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == request.BabyId, ct);

        return MapToDto(activity, baby?.Name ?? string.Empty, baby?.AvatarUrl, userId);
    }

    /// <inheritdoc />
    public async Task<(IReadOnlyList<ActivityResponseDto> Items, int Total)> GetFeedAsync(int skip, int limit, CancellationToken ct = default)
    {
        var accessibleBabyIds = await GetAccessibleBabyIdsAsync(ct);

        if (accessibleBabyIds.Count == 0)
            return ([], 0);

        var query = _dbContext.Activities
            .AsNoTracking()
            .Where(a => accessibleBabyIds.Contains(a.BabyId));

        var total = await query.CountAsync(ct);

        var activities = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip(skip)
            .Take(limit)
            .Join(
                _dbContext.Babies.AsNoTracking(),
                a => a.BabyId,
                b => b.Id,
                (a, b) => new { Activity = a, Baby = b })
            .ToListAsync(ct);

        var items = activities.Select(x => MapToDto(x.Activity, x.Baby.Name, x.Baby.AvatarUrl, x.Activity.CreatedBy)).ToList();
        return (items, total);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ActivityResponseDto>> GetBabyActivitiesAsync(string babyId, int limit, CancellationToken ct = default)
    {
        if (!await _authorizationService.CanAccessBabyAsync(babyId))
            throw new UnauthorizedAccessException("您沒有權限存取此寶寶的活動記錄");

        var baby = await _dbContext.Babies.AsNoTracking().FirstOrDefaultAsync(b => b.Id == babyId, ct);

        var activities = await _dbContext.Activities
            .AsNoTracking()
            .Where(a => a.BabyId == babyId)
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .ToListAsync(ct);

        return activities.Select(a => MapToDto(a, baby?.Name ?? string.Empty, baby?.AvatarUrl, a.CreatedBy)).ToList();
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<BabyActivitySummaryDto>> GetBabyActivitySummariesAsync(CancellationToken ct = default)
    {
        var accessibleBabyIds = await GetAccessibleBabyIdsAsync(ct);

        if (accessibleBabyIds.Count == 0)
            return [];

        var summaries = await _dbContext.Activities
            .AsNoTracking()
            .Where(a => accessibleBabyIds.Contains(a.BabyId))
            .GroupBy(a => a.BabyId)
            .Select(g => new
            {
                BabyId = g.Key,
                LatestActivityAt = g.Max(a => a.CreatedAt),
                ActivityCount = g.Count()
            })
            .Join(
                _dbContext.Babies.AsNoTracking(),
                s => s.BabyId,
                b => b.Id,
                (s, b) => new BabyActivitySummaryDto(
                    b.Id,
                    b.Name,
                    b.AvatarUrl,
                    s.LatestActivityAt,
                    s.ActivityCount))
            .ToListAsync(ct);

        return summaries.OrderByDescending(s => s.LatestActivityAt).ToList();
    }

    private async Task<List<string>> GetAccessibleBabyIdsAsync(CancellationToken ct)
    {
        var userRoles = GetUserRoles();
        var userId = GetCurrentUserId();

        if (userRoles.Contains("SystemAdmin"))
        {
            return await _dbContext.Babies
                .AsNoTracking()
                .Select(b => b.Id)
                .ToListAsync(ct);
        }

        if (userRoles.Contains("Nanny"))
        {
            return await _dbContext.Babies
                .AsNoTracking()
                .Where(b => b.NannyId == userId)
                .Select(b => b.Id)
                .ToListAsync(ct);
        }

        if (userRoles.Contains("Parent"))
        {
            return await _dbContext.BabyParents
                .AsNoTracking()
                .Where(bp => bp.ParentId == userId)
                .Select(bp => bp.BabyId)
                .ToListAsync(ct);
        }

        return [];
    }

    private static ActivityResponseDto MapToDto(Activity activity, string babyName, string? babyAvatarUrl, string createdByUserId)
    {
        return new ActivityResponseDto(
            activity.Id,
            activity.BabyId,
            babyName,
            babyAvatarUrl,
            activity.Type,
            activity.PhotoUrl,
            activity.Notes,
            activity.TypeOption,
            activity.CreatedAt,
            createdByUserId);
    }

    private string GetCurrentUserId()
    {
        var user = _httpContextAccessor?.HttpContext?.User;
        var userId = user?.FindFirst("sub")?.Value ??
                     user?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userId ?? throw new UnauthorizedAccessException("無法獲取當前用戶 ID");
    }

    private List<string> GetUserRoles()
    {
        var user = _httpContextAccessor?.HttpContext?.User;
        if (user == null) return [];
        return user.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
    }
}
