using System.Linq.Expressions;

namespace BaboCare.Domain.Abstractions;

/// <summary>
/// 規格模式基類，子類用於定義具體的查詢條件
/// </summary>
public abstract class Specification<T>
{
    public Expression<Func<T, bool>>? Criteria { get; protected init; }

    public List<Expression<Func<T, object>>> Includes { get; } = [];

    public Expression<Func<T, object>>? OrderBy { get; protected init; }

    public Expression<Func<T, object>>? OrderByDescending { get; protected init; }

    public int? Take { get; protected init; }

    public int? Skip { get; protected init; }
}
