using BaboCare.Application.Persistence;
using BaboCare.Domain.Entities.Users;
using BaboCare.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace BaboCare.Api.Tests;

/// <summary>
/// 整合測試用 WebApplicationFactory：
/// - 以 InMemory DB 取代 PostgreSQL
/// - 以假的 TestAuth 取代 OpenIddict 驗證
/// </summary>
public class BaboWebApplicationFactory : WebApplicationFactory<Program>
{
    public const string TestNannyId = "TEST_NANNY_001";
    public const string TestAdminId = "TEST_ADMIN_001";
    public const string TestParentId = "TEST_PARENT_001";

    // 每個 Factory 實例共享一個 DB 名稱，讓 Seed 和請求用同一個
    private readonly string _dbName = "TestDb_" + Guid.NewGuid().ToString("N");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // ── 移除所有與 AppDbContext 相關的服務描述符 ──────────────────
            var toRemove = services
                .Where(d =>
                    d.ServiceType == typeof(DbContextOptions<AppDbContext>) ||
                    d.ServiceType == typeof(DbContextOptions) ||
                    d.ServiceType == typeof(AppDbContext) ||
                    d.ServiceType == typeof(IAppDbContext))
                .ToList();
            foreach (var d in toRemove) services.Remove(d);

            // ── 移除 Npgsql EF Core 提供者服務（避免 provider 衝突）───────
            var npgsqlDescriptors = services
                .Where(d =>
                    d.ServiceType.Assembly.GetName().Name?.StartsWith("Npgsql") == true ||
                    (d.ImplementationType?.Assembly.GetName().Name?.StartsWith("Npgsql") == true))
                .ToList();
            foreach (var d in npgsqlDescriptors) services.Remove(d);

            // ── 加入 InMemory DbContext，使用獨立 ServiceProvider 避免 Npgsql 衝突 ──
            // 為 AppDbContext 建立只含 InMemory 的內部 ServiceProvider
            var testInternalSp = new ServiceCollection()
                .AddEntityFrameworkInMemoryDatabase()
                .BuildServiceProvider();

            services.AddDbContext<AppDbContext>(options =>
                options
                    .UseInMemoryDatabase(_dbName)
#pragma warning disable EF1001 // Internal EF Core API
                    .UseInternalServiceProvider(testInternalSp)
#pragma warning restore EF1001
            );

            services.AddScoped<IAppDbContext>(sp =>
                sp.GetRequiredService<AppDbContext>());

            // ── 移除 OpenIddict 驗證並換成假的 TestAuth ──────────────────
            var authDescriptors = services
                .Where(d => d.ServiceType.FullName?.Contains("OpenIddict") == true ||
                            d.ImplementationType?.FullName?.Contains("OpenIddict") == true)
                .ToList();
            foreach (var d in authDescriptors) services.Remove(d);

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = TestAuthHandler.SchemeName;
                options.DefaultChallengeScheme = TestAuthHandler.SchemeName;
            })
            .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                TestAuthHandler.SchemeName, _ => { });
        });

        builder.UseEnvironment("Testing");
    }

    /// <summary>
    /// 建立以指定使用者（userId, role）認證的 HttpClient
    /// </summary>
    public HttpClient CreateClientAsUser(string userId, string role)
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthHandler.UserIdHeader, userId);
        client.DefaultRequestHeaders.Add(TestAuthHandler.RoleHeader, role);
        return client;
    }

    /// <summary>
    /// 在測試資料庫中植入測試資料
    /// </summary>
    public async Task SeedAsync(Func<AppDbContext, UserManager<ApplicationUser>, Task> seedAction)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        await seedAction(db, userManager);
    }
}

/// <summary>
/// 測試用假 Auth Handler：讀取 Request Header 中的 userId / role
/// </summary>
public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string SchemeName = "TestAuth";
    public const string UserIdHeader = "X-Test-User-Id";
    public const string RoleHeader = "X-Test-User-Role";

    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder) { }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(UserIdHeader, out var userId)
            || string.IsNullOrWhiteSpace(userId))
            return Task.FromResult(AuthenticateResult.Fail("No test user header"));

        var role = Request.Headers.TryGetValue(RoleHeader, out var r) ? r.ToString() : "Nanny";

        var claims = new List<Claim>
        {
            new Claim("sub", userId!),
            new Claim(ClaimTypes.NameIdentifier, userId!),
            new Claim(ClaimTypes.Role, role),
            new Claim("role", role),
        };

        var identity = new ClaimsIdentity(claims, SchemeName);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, SchemeName);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
