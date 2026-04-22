using BaboCare.Domain.Entities.Users;
using Microsoft.AspNetCore.Identity;

namespace BaboCare.Identity.Services;

/// <summary>
/// 資料庫初始化服務，在應用啟動時創建種子用戶與角色
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

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();

        // 建立角色種子資料
        string[] roles = ["SystemAdmin", "Nanny", "Parent"];
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new ApplicationRole(role));
                _logger.LogInformation("Role '{Role}' created.", role);
            }
        }

        // 建立預設種子使用者
        var username = _configuration["Seed:Username"] ?? "admin";
        var password = _configuration["Seed:Password"] ?? "BaboCare@123";

        var existing = await userManager.FindByNameAsync(username);
        if (existing is null)
        {
            var user = new ApplicationUser
            {
                UserName = username,
                Email = $"{username}@babocare.local",
                DisplayName = "系統管理員",
                IsActive = true,
                IsDeleted = false
            };
            var result = await userManager.CreateAsync(user, password);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, "SystemAdmin");
                _logger.LogInformation("Seed user '{Username}' created with SystemAdmin role.", username);
            }
            else
            {
                _logger.LogWarning("Failed to create seed user: {Errors}",
                    string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }
        else
        {
            var needsUpdate = false;
            if (!existing.IsActive || existing.IsDeleted)
            {
                existing.IsActive = true;
                existing.IsDeleted = false;
                needsUpdate = true;
            }
            if (needsUpdate)
            {
                await userManager.UpdateAsync(existing);
                _logger.LogInformation("Seed user '{Username}' re-activated.", username);
            }
            // 確保種子使用者擁有 SystemAdmin 角色
            if (!await userManager.IsInRoleAsync(existing, "SystemAdmin"))
            {
                await userManager.AddToRoleAsync(existing, "SystemAdmin");
                _logger.LogInformation("Seed user '{Username}' assigned SystemAdmin role.", username);
            }
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
