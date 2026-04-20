using BaboCare.Application.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace BaboCare.Infrastructure.Services;

/// <summary>
/// 檔案存儲服務實現 - 處理檔案上傳、下載和刪除到專案靜態檔案資料夾
/// </summary>
public class FileStorageService : IFileStorageService
{
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;
    private readonly string _uploadRootPath;
    private readonly string _urlPrefix;
    private readonly string[] _allowedExtensions;
    private readonly long _maxFileSize;

    public FileStorageService(IConfiguration configuration, IWebHostEnvironment environment)
    {
        _configuration = configuration;
        _environment = environment;

        // 從 appsettings 讀取配置
        var fileStorageConfig = _configuration.GetSection("FileStorage");
        _uploadRootPath = fileStorageConfig["UploadPath"] ?? Path.Combine("wwwroot", "uploads");
        _urlPrefix = fileStorageConfig["UrlPrefix"] ?? "/uploads/";
        _allowedExtensions = (fileStorageConfig["AllowedExtensions"] ?? "jpg,jpeg,png,gif").Split(',');
        _maxFileSize = long.TryParse(fileStorageConfig["MaxFileSizeMB"], out var size) ? size * 1024 * 1024 : 5 * 1024 * 1024;

        // 確保上傳目錄存在
        EnsureUploadDirectoryExists();
    }

    /// <summary>
    /// 驗證檔案是否符合要求
    /// </summary>
    public async Task<FileValidationResult> ValidateFileAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return FileValidationResult.Failure("檔案不能為空");
        }

        if (file.Length > _maxFileSize)
        {
            return FileValidationResult.Failure($"檔案大小不能超過 {_maxFileSize / (1024 * 1024)} MB");
        }

        var extension = Path.GetExtension(file.FileName).TrimStart('.').ToLower();
        if (!_allowedExtensions.Contains(extension))
        {
            return FileValidationResult.Failure($"不支援的檔案格式。允許的格式：{string.Join(", ", _allowedExtensions)}");
        }

        // 驗證 MIME 類型
        var validMimeTypes = new[] { "image/jpeg", "image/png", "image/gif" };
        if (!validMimeTypes.Contains(file.ContentType?.ToLower()))
        {
            return FileValidationResult.Failure("不支援的 MIME 類型");
        }

        return await Task.FromResult(FileValidationResult.Success());
    }

    /// <summary>
    /// 保存檔案到指定目錄
    /// </summary>
    public async Task<string> SaveFileAsync(IFormFile file, string subdirectory)
    {
        var validation = await ValidateFileAsync(file);
        if (!validation.IsValid)
        {
            throw new InvalidOperationException(validation.ErrorMessage);
        }

        var relativePath = Path.Combine(_uploadRootPath, subdirectory);
        var fullPath = Path.Combine(_environment.WebRootPath ?? "wwwroot", relativePath);

        // 確保子目錄存在
        Directory.CreateDirectory(fullPath);

        // 生成唯一的檔案名稱
        var fileName = GenerateUniqueFileName(file.FileName);
        var filePath = Path.Combine(fullPath, fileName);

        // 保存檔案
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // 返回可訪問的 URL
        var relativeUrl = Path.Combine(subdirectory, fileName).Replace("\\", "/");
        return $"{_urlPrefix}{relativeUrl}";
    }

    /// <summary>
    /// 刪除指定的檔案
    /// </summary>
    public async Task DeleteFileAsync(string fileUrl)
    {
        if (string.IsNullOrEmpty(fileUrl))
        {
            return;
        }

        try
        {
            // 從 URL 中提取相對路徑
            var relativePath = fileUrl.TrimStart('/');
            if (relativePath.StartsWith(_urlPrefix.TrimStart('/')))
            {
                relativePath = relativePath.Substring(_urlPrefix.TrimStart('/').Length);
            }

            var fullPath = Path.Combine(_environment.WebRootPath ?? "wwwroot", _uploadRootPath, relativePath);

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }

            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            // 記錄錯誤但不拋出異常，以免影響主要操作
            Console.WriteLine($"Error deleting file {fileUrl}: {ex.Message}");
        }
    }

    /// <summary>
    /// 檔案路徑轉為可訪問 URL
    /// </summary>
    public string GetAccessUrl(string filePath)
    {
        if (string.IsNullOrEmpty(filePath))
        {
            return string.Empty;
        }

        // 如果已經是 URL，直接返回
        if (filePath.StartsWith("http"))
        {
            return filePath;
        }

        // 構建 URL
        var relativePath = filePath.Replace("\\", "/");
        if (!relativePath.StartsWith(_urlPrefix))
        {
            relativePath = Path.Combine(_uploadRootPath, relativePath).Replace("\\", "/");
            return $"{_urlPrefix}{relativePath}";
        }

        return relativePath;
    }

    private void EnsureUploadDirectoryExists()
    {
        var fullPath = Path.Combine(_environment.WebRootPath ?? "wwwroot", _uploadRootPath);
        if (!Directory.Exists(fullPath))
        {
            Directory.CreateDirectory(fullPath);
        }
    }

    private string GenerateUniqueFileName(string originalFileName)
    {
        var extension = Path.GetExtension(originalFileName);
        var fileName = $"{Ulid.NewUlid()}{extension.ToLower()}";
        return fileName;
    }
}
