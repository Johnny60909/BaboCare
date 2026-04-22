using BaboCare.Domain.Entities.Babies;

namespace BaboCare.Domain.Abstractions;

/// <summary>
/// 按保母 ID 查詢寶寶的規範
/// </summary>
public class BabiesByNannySpecification : Specification<Baby>
{
    public BabiesByNannySpecification(string nannyId)
    {
        AddFilter(b => b.NannyId == nannyId);
        AddOrderBy(b => b.Name);
    }
}

/// <summary>
/// 按家長 ID 查詢寶寶的規範
/// </summary>
public class BabiesByParentSpecification : Specification<Baby>
{
    public BabiesByParentSpecification(string parentId)
    {
        // 通過 BabyParent 關聯表查詢
        AddInclude(b => b.Parents.Where(bp => bp.ParentId == parentId));
        AddOrderBy(b => b.Name);
    }
}

/// <summary>
/// 查詢所有寶寶的規範
/// </summary>
public class AllBabiesSpecification : Specification<Baby>
{
    public AllBabiesSpecification()
    {
        AddInclude(b => b.Parents);
        AddOrderBy(b => b.Name);
    }
}
