using BaboCare.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace BaboCare.Identity.Services;

/// <summary>
/// 資料庫初始化服務，在應用啟動時創建種子用戶
/// </summary>
public class DbSeeder : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IConfiguration _configuration;
    private readonly ILogger<DbSeeder> _logger;

    public DbSeeder(
        IServiceProvider serviceProvider,
        IConfiguration configuration,
        ILogger<DbSeeder> logger)
    {
        _serviceProvider = serviceProvider;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// 在應用啟動時創建默認種子用戶
    /// </summary>
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        var username = _configuration["Seed:Username"] ?? "nanny";
        var password = _configuration["Seed:Password"] ?? "BaboCare@123";

        var existing = await userManager.FindByNameAsync(username);
        if (existing is null)
        {
            var user = new ApplicationUser { UserName = username, Email = $"{username}@babocare.local" };
            var result = await userManager.CreateAsync(user, password);
            if (result.Succeeded)
                _logger.LogInformation("Seed user '{Username}' created.", username);
            else
                _logger.LogWarning("Failed to create seed user: {Errors}",
                    string.Join(", ", result.Errors.Select(e => e.Description)));
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
