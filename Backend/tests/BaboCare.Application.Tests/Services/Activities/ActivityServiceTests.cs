using BaboCare.Application.Dtos.Activities;
using BaboCare.Application.Services;
using BaboCare.Domain.Entities.Activities;
using BaboCare.Domain.Entities.Babies;
using BaboCare.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Moq;
using Shouldly;
using System.Security.Claims;
using Xunit;

namespace BaboCare.Application.Tests.Services.Activities;

public class ActivityServiceTests : IAsyncDisposable
{
    private readonly AppDbContext _dbContext;
    private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
    private readonly BabyAuthorizationService _authService;
    private readonly ActivityService _activityService;

    private const string NannyId = "01NANNY000000000000000000A";
    private const string BabyId = "01BABY0000000000000000000A";
    private const string PhotoUrl = "https://example.com/photo.jpg";

    public ActivityServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _dbContext = new AppDbContext(options);
        _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();

        _authService = new BabyAuthorizationService(_dbContext, _mockHttpContextAccessor.Object);
        _activityService = new ActivityService(_dbContext, _authService, _mockHttpContextAccessor.Object);
    }

    public async ValueTask DisposeAsync() => await _dbContext.DisposeAsync();

    private void SetupUser(string userId, string role)
    {
        var claims = new List<Claim>
        {
            new Claim("sub", userId),
            new Claim(ClaimTypes.Role, role),
            new Claim("role", role),
        };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "Test"));
        _mockHttpContextAccessor.Setup(x => x.HttpContext)
            .Returns(new DefaultHttpContext { User = principal });
    }

    private async Task SeedBabyForNanny()
    {
        var baby = new Baby("小花", new DateOnly(2024, 1, 1), "女", NannyId, NannyId);
        // Force specific Id for test predictability
        _dbContext.Babies.Add(baby);
        await _dbContext.SaveChangesAsync();
    }

    // ─── Task 6.2: 授權邏輯 ────────────────────────────────────────────────

    [Fact]
    public async Task CreateActivity_Nanny_WithOwnBaby_ShouldSucceed()
    {
        // Arrange
        SetupUser(NannyId, "Nanny");
        await SeedBabyForNanny();
        var baby = await _dbContext.Babies.FirstAsync();

        var request = new CreateActivityRequestDto(baby.Id, ActivityType.Feeding, PhotoUrl, "備註", null);

        // Act
        var result = await _activityService.CreateActivityAsync(request);

        // Assert
        result.ShouldNotBeNull();
        result.BabyId.ShouldBe(baby.Id);
        result.Type.ShouldBe(ActivityType.Feeding);
        (await _dbContext.Activities.CountAsync()).ShouldBe(1);
    }

    [Fact]
    public async Task CreateActivity_Nanny_WithOtherNannyBaby_ShouldThrow()
    {
        // Arrange
        SetupUser("other_nanny", "Nanny");
        await SeedBabyForNanny(); // baby belongs to NannyId, not "other_nanny"
        var baby = await _dbContext.Babies.FirstAsync();

        var request = new CreateActivityRequestDto(baby.Id, ActivityType.Feeding, PhotoUrl, null, null);

        // Act & Assert
        await Should.ThrowAsync<UnauthorizedAccessException>(
            () => _activityService.CreateActivityAsync(request));
    }

    [Fact]
    public async Task CreateActivity_SystemAdmin_AnyBaby_ShouldSucceed()
    {
        // Arrange
        SetupUser("admin_user", "SystemAdmin");
        await SeedBabyForNanny();
        var baby = await _dbContext.Babies.FirstAsync();

        var request = new CreateActivityRequestDto(baby.Id, ActivityType.Diaper, PhotoUrl, null, null);

        // Act
        var result = await _activityService.CreateActivityAsync(request);

        // Assert
        result.ShouldNotBeNull();
    }

    // ─── Task 6.3: 動態牆排序（CreatedAt DESC） ────────────────────────────

    [Fact]
    public async Task GetFeedAsync_ShouldReturnActivitiesOrderedByCreatedAtDesc()
    {
        // Arrange
        SetupUser(NannyId, "Nanny");
        await SeedBabyForNanny();
        var baby = await _dbContext.Babies.FirstAsync();

        // 加入三筆活動
        var older = new Activity(baby.Id, ActivityType.Sleep, PhotoUrl, null, null, NannyId);
        var newer = new Activity(baby.Id, ActivityType.Feeding, PhotoUrl, null, null, NannyId);
        var newest = new Activity(baby.Id, ActivityType.Diaper, PhotoUrl, null, null, NannyId);
        _dbContext.Activities.AddRange(older, newer, newest);
        await _dbContext.SaveChangesAsync();

        // SaveChangesAsync (Added) 會覆寫 CreatedAt，
        // 以 Modified 狀態再更新 CreatedAt（Modified 不觸碰 CreatedAt）
        var baseTime = DateTime.UtcNow;
        older.CreatedAt = baseTime.AddHours(-2);
        newer.CreatedAt = baseTime.AddHours(-1);
        newest.CreatedAt = baseTime;
        await _dbContext.SaveChangesAsync();

        // Act
        var (items, total) = await _activityService.GetFeedAsync(skip: 0, limit: 20);

        // Assert
        total.ShouldBe(3);
        items.Count.ShouldBe(3);
        items[0].Type.ShouldBe(ActivityType.Diaper);   // newest
        items[1].Type.ShouldBe(ActivityType.Feeding);  // newer
        items[2].Type.ShouldBe(ActivityType.Sleep);    // older
    }

    [Fact]
    public async Task GetFeedAsync_ShouldRespectPagination()
    {
        // Arrange
        SetupUser(NannyId, "Nanny");
        await SeedBabyForNanny();
        var baby = await _dbContext.Babies.FirstAsync();

        var activities = Enumerable.Range(0, 5)
            .Select(_ => new Activity(baby.Id, ActivityType.Feeding, PhotoUrl, null, null, NannyId))
            .ToList();
        _dbContext.Activities.AddRange(activities);
        await _dbContext.SaveChangesAsync();

        // 更新 CreatedAt 使每筆有不同時間
        var baseTime = DateTime.UtcNow;
        for (var i = 0; i < activities.Count; i++)
            activities[i].CreatedAt = baseTime.AddMinutes(-i);
        await _dbContext.SaveChangesAsync();

        // Act
        var (page1, total) = await _activityService.GetFeedAsync(skip: 0, limit: 2);
        var (page2, _) = await _activityService.GetFeedAsync(skip: 2, limit: 2);

        // Assert
        total.ShouldBe(5);
        page1.Count.ShouldBe(2);
        page2.Count.ShouldBe(2);
        page1.Select(x => x.Id).Intersect(page2.Select(x => x.Id)).ShouldBeEmpty();
    }

    [Fact]
    public async Task GetFeedAsync_NonAdminUser_ShouldOnlySeeOwnBabies()
    {
        // Arrange - 有兩隻寶寶，分屬不同保母
        SetupUser(NannyId, "Nanny");

        var baby1 = new Baby("寶寶A", new DateOnly(2024, 1, 1), "男", NannyId, NannyId);
        var baby2 = new Baby("寶寶B", new DateOnly(2024, 1, 1), "女", "other_nanny", "other_nanny");
        _dbContext.Babies.AddRange(baby1, baby2);
        await _dbContext.SaveChangesAsync();

        _dbContext.Activities.AddRange(
            new Activity(baby1.Id, ActivityType.Feeding, PhotoUrl, null, null, NannyId),
            new Activity(baby2.Id, ActivityType.Diaper, PhotoUrl, null, null, "other_nanny"));
        await _dbContext.SaveChangesAsync();

        // Act
        var (items, total) = await _activityService.GetFeedAsync(skip: 0, limit: 20);

        // Assert: 只看到自己負責的寶寶 (baby1) 的活動
        total.ShouldBe(1);
        items[0].BabyId.ShouldBe(baby1.Id);
    }
}
