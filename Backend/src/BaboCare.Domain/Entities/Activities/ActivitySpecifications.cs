using BaboCare.Domain.Abstractions;

namespace BaboCare.Domain.Entities.Activities;

/// <summary>
/// 取得指定寶寶的活動清單（用於轉盤），最新 N 筆
/// </summary>
public class BabyActivitiesSpecification : Specification<Activity>
{
    public BabyActivitiesSpecification(string babyId, int limit = 20)
    {
        AddFilter(a => a.BabyId == babyId);
        AddOrderByDescending(a => a.CreatedAt);
        Take = limit;
    }
}

/// <summary>
/// 取得多隻寶寶的活動動態牆（無限滾動）
/// </summary>
public class ActivityFeedSpecification : Specification<Activity>
{
    public ActivityFeedSpecification(IEnumerable<string> babyIds, int skip = 0, int limit = 20)
    {
        var ids = babyIds.ToList();
        AddFilter(a => ids.Contains(a.BabyId));
        AddOrderByDescending(a => a.CreatedAt);
        Skip = skip;
        Take = limit;
    }
}
