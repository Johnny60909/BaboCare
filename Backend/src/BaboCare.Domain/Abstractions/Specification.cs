using System.Linq.Expressions;

namespace BaboCare.Domain.Abstractions;

/// <summary>
/// 規格模式基類，子類用於定義具體的查詢條件
/// </summary>
public abstract class Specification<T>
{
    private Expression<Func<T, bool>>? _criteria;
    private Expression<Func<T, object>>? _orderBy;
    private Expression<Func<T, object>>? _orderByDescending;

    public Expression<Func<T, bool>>? Criteria => _criteria;

    public List<Expression<Func<T, object>>> Includes { get; } = [];

    public Expression<Func<T, object>>? OrderBy => _orderBy;

    public Expression<Func<T, object>>? OrderByDescending => _orderByDescending;

    public int? Take { get; protected set; }

    public int? Skip { get; protected set; }

    /// <summary>
    /// 添加過濾條件
    /// </summary>
    protected void AddFilter(Expression<Func<T, bool>> criteria)
    {
        _criteria = criteria;
    }

    /// <summary>
    /// 添加包含導航屬性
    /// </summary>
    protected void AddInclude(Expression<Func<T, object>> includeExpression)
    {
        Includes.Add(includeExpression);
    }

    /// <summary>
    /// 添加排序（升序）
    /// </summary>
    protected void AddOrderBy(Expression<Func<T, object>> orderByExpression)
    {
        _orderBy = orderByExpression;
    }

    /// <summary>
    /// 添加排序（降序）
    /// </summary>
    protected void AddOrderByDescending(Expression<Func<T, object>> orderByDescendingExpression)
    {
        _orderByDescending = orderByDescendingExpression;
    }

    /// <summary>
    /// 設置分頁 - 取得數量
    /// </summary>
    protected void ApplyPaging(int take)
    {
        Take = take;
    }

    /// <summary>
    /// 設置分頁 - 跳過數量
    /// </summary>
    protected void ApplyPaging(int skip, int take)
    {
        Skip = skip;
        Take = take;
    }
}
