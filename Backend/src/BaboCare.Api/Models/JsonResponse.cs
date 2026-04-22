namespace BaboCare.Api.Models;

/// <summary>
/// 統一響應狀態碼
/// </summary>
public enum ResponseStateEnum
{
    /// <summary>
    /// 成功
    /// </summary>
    Success = 111,

    /// <summary>
    /// 資源不存在
    /// </summary>
    NotFound = 493,

    /// <summary>
    /// 權限不足
    /// </summary>
    NoPermission = 495,

    /// <summary>
    /// 系統錯誤
    /// </summary>
    Error = 999
}

/// <summary>
/// 統一響應結構
/// </summary>
public class JsonResponse
{
    public ResponseStateEnum State { get; set; } = ResponseStateEnum.Success;
    public string? Message { get; set; }
    public object? Result { get; set; }

    public static JsonResponse Success(object? result = null) => new() { State = ResponseStateEnum.Success, Result = result };
    public static JsonResponse Fail(string message, ResponseStateEnum state = ResponseStateEnum.Error) => new() { State = state, Message = message };
}

/// <summary>
/// 泛型統一響應結構
/// </summary>
public class JsonResponse<T>
{
    public ResponseStateEnum State { get; set; } = ResponseStateEnum.Success;
    public string? Message { get; set; }
    public T? Result { get; set; }

    public static JsonResponse<T> Success(T result) => new() { State = ResponseStateEnum.Success, Result = result };
    public static JsonResponse<T> Fail(string message, ResponseStateEnum state = ResponseStateEnum.Error) => new() { State = state, Message = message };
}

/// <summary>
/// 統一分頁響應結構
/// </summary>
public class JsonTableResponse<T> : JsonResponse<List<T>>
{
    public int Total { get; set; }

    public static JsonTableResponse<T> Success(List<T> result, int total) => new()
    {
        State = ResponseStateEnum.Success,
        Result = result,
        Total = total
    };
}
