using BaboCare.Domain.Entities.Users;
using BaboCare.Identity.Services;
using BaboCare.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OpenIddict.Validation.AspNetCore;

namespace BaboCare.Identity;

public static class IdentityServiceExtensions
{
    /// <summary>
    /// 將 OpenIddict Server（發行 Token）及相關 Identity 服務註冊至 DI 容器
    /// </summary>
    public static IServiceCollection AddIdentityModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
            {
                options.Password.RequireDigit = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequiredLength = 6;
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();

        // AddIdentity 會把預設 Auth Scheme 設為 Cookie，
        // 這裡覆蓋為 OpenIddict Validation scheme，讓 Bearer token 能正常驗證
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme;
            options.DefaultForbidScheme = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme;
        });

        var accessTokenLifetime = TimeSpan.Parse(
            configuration["OpenIddict:AccessTokenLifetime"] ?? "00:15:00");
        var refreshTokenLifetime = TimeSpan.Parse(
            configuration["OpenIddict:RefreshTokenLifetime"] ?? "7.00:00:00");

        services.AddOpenIddict()
            .AddCore(options =>
            {
                options.UseEntityFrameworkCore()
                       .UseDbContext<AppDbContext>();
            })
            .AddServer(options =>
            {
                options.SetTokenEndpointUris("/connect/token");

                options.AllowPasswordFlow()
                       .AllowRefreshTokenFlow();

                options.AcceptAnonymousClients();

                options.SetAccessTokenLifetime(accessTokenLifetime)
                       .SetRefreshTokenLifetime(refreshTokenLifetime);

                options.DisableAccessTokenEncryption();

                options.AddDevelopmentEncryptionCertificate()
                       .AddDevelopmentSigningCertificate();

                options.UseAspNetCore()
                       .EnableTokenEndpointPassthrough()
                       .DisableTransportSecurityRequirement();
            })
            .AddValidation(options =>
            {
                options.UseLocalServer();
                options.UseAspNetCore();
            });

        // DB 種子資料
        services.AddHostedService<DbSeeder>();

        return services;
    }
}
