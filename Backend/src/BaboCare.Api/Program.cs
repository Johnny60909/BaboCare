using BaboCare.Application.Persistence;
using BaboCare.Application.Services;
using BaboCare.Api.Filters;
using BaboCare.Identity;
using BaboCare.Infrastructure.Persistence;
using BaboCare.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(options =>
{
    // 註冊全域異常過濾器
    options.Filters.Add<ApiExceptionFilter>();
})
// 讓 Api 自動採用 BaboCare.Identity assembly 裡的 Controller
.AddApplicationPart(typeof(BaboCare.Identity.IdentityServiceExtensions).Assembly);

// Add HttpContext accessor for services that need current user context
builder.Services.AddHttpContextAccessor();

// Application Services
builder.Services.AddScoped<IAdminUserService, AdminUserService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IPendingAccountService, PendingAccountService>();
builder.Services.AddScoped<IBabyService, BabyService>();
builder.Services.AddScoped<BabyAuthorizationService>();
builder.Services.AddScoped<IFileStorageService, FileStorageService>();
builder.Services.AddScoped<IActivityService, ActivityService>();

// Swagger/OpenAPI
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title = "BaboCare API",
        Version = "v1",
        Description = "BaboCare Backend API with OpenIddict Authorization"
    });

    // Add security definition for JWT/OpenIddict
    options.AddSecurityDefinition("Bearer", new()
    {
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "JWT Authorization header using the Bearer scheme"
    });

    options.AddSecurityRequirement(new()
    {
        {
            new() { Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" } },
            new string[] { }
        }
    });
});

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
    options.UseOpenIddict();
});

// Register IAppDbContext interface for Application layer
builder.Services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());

// Identity Module - OpenIddict Server + Seeder
builder.Services.AddIdentityModule(builder.Configuration);

// CORS - 從 appsettings 讀取允許的來源
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure static files middleware for serving uploaded files
app.UseStaticFiles();

// Swagger UI
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "BaboCare API V1");
    options.RoutePrefix = string.Empty; // Swagger UI at root
});

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
