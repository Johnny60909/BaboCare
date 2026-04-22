using BaboCare.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.ComponentModel.DataAnnotations;

namespace BaboCare.Api.Filters;

/// <summary>
/// 全域異常過濾器 - 自動捕獲未處理的異常並轉化為統一的 JsonResponse 格式
/// </summary>
public class ApiExceptionFilter : IAsyncExceptionFilter
{
    private readonly ILogger<ApiExceptionFilter> _logger;

    public ApiExceptionFilter(ILogger<ApiExceptionFilter> logger)
    {
        _logger = logger;
    }

    public Task OnExceptionAsync(ExceptionContext context)
    {
        if (context.Exception is null)
            return Task.CompletedTask;

        _logger.LogError(context.Exception, "Unhandled exception occurred. Message: {Message}", context.Exception.Message);

        var response = context.Exception switch
        {
            // 驗證異常 (DTO 驗證失敗)
            ValidationException ex => new JsonResponse
            {
                State = ResponseStateEnum.Error,
                Message = ex.Message
            },

            // 業務邏輯異常 (自定義)
            InvalidOperationException ex => new JsonResponse
            {
                State = ResponseStateEnum.Error,
                Message = ex.Message
            },

            // 資源不存在異常
            KeyNotFoundException ex => new JsonResponse
            {
                State = ResponseStateEnum.NotFound,
                Message = ex.Message
            },

            // 未授權異常 (如果需要)
            UnauthorizedAccessException ex => new JsonResponse
            {
                State = ResponseStateEnum.NoPermission,
                Message = ex.Message
            },

            // 其他預設異常
            _ => new JsonResponse
            {
                State = ResponseStateEnum.Error,
                Message = "系統內部錯誤，請稍後重試"
            }
        };

        context.Result = new ObjectResult(response)
        {
            StatusCode = 200  // 統一返回 200，狀態由 JsonResponse.State 決定
        };

        context.ExceptionHandled = true;
        return Task.CompletedTask;
    }
}
