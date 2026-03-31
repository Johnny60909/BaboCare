namespace BaboCare.Domain.Abstractions;

/// <summary>
/// 聚合根 - 事件溯源模式，子類實現 EnsureValidStateAsync 和 WhenAsync
/// </summary>
public abstract class AggregateRoot
{
    private readonly List<object> _events = [];

    public IReadOnlyList<object> DomainEvents => _events.AsReadOnly();

    public void ClearDomainEvents() => _events.Clear();

    public async Task TriggerAsync(object @event)
    {
        await EnsureValidStateAsync(@event);
        await WhenAsync(@event);
        _events.Add(@event);
    }

    /// <summary>
    /// 驗證事件在當前狀態下是否合法
    /// </summary>
    protected abstract Task EnsureValidStateAsync(object @event);

    /// <summary>
    /// 處理事件並更新狀態
    /// </summary>
    protected abstract Task WhenAsync(object @event);
}
