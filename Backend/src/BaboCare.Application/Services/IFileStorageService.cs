using Microsoft.AspNetCore.Http;

namespace BaboCare.Application.Services;

/// <summary>
/// 檔案驗證結果
/// </summary>
public class FileValidationResult
{
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }

    public static FileValidationResult Success() => new() { IsValid = true };
    public static FileValidationResult Failure(string message) => new() { IsValid = false, ErrorMessage = message };
}

/// <summary>
/// 檔案存儲服務介面 - 處理檔案上傳、下載和刪除
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// 驗證檔案是否符合要求
    /// </summary>
    Task<FileValidationResult> ValidateFileAsync(IFormFile file);

    /// <summary>
    /// 保存檔案到指定目錄
    /// </summary>
    /// <param name="file">要保存的檔案</param>
    /// <param name="subdirectory">子目錄路徑（相對於配置的上傳根目錄）</param>
    /// <returns>可訪問的 URL 路徑</returns>
    Task<string> SaveFileAsync(IFormFile file, string subdirectory);

    /// <summary>
    /// 刪除指定的檔案
    /// </summary>
    Task DeleteFileAsync(string fileUrl);

    /// <summary>
    /// 檔案路徑轉為可訪問 URL
    /// </summary>
    string GetAccessUrl(string filePath);
}
