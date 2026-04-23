using AwesomeAssertions;
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

namespace BaboCare.Api.Tests.Activities;

/// <summary>
/// 16.1-16.5 end-to-end integration tests (service layer)
/// Uses InMemory DB + real ActivityService to validate full data flow
/// </summary>
public class ActivityIntegrationTests : IAsyncDisposable
{
    private readonly AppDbContext _db;
    private readonly Mock<IHttpContextAccessor> _mockHttp;
    private readonly BabyAuthorizationService _authService;
    private readonly ActivityService _service;

    private const string NannyId = "INT_NANNY_001";
    private const string AdminId = "INT_ADMIN_001";
    private const string OtherNannyId = "INT_OTHER_NANNY_002";
    private const string PhotoUrl = "https://example.com/photo.jpg";

    public ActivityIntegrationTests()
    {
        var opts = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("IntegrationTestDb_" + Guid.NewGuid().ToString("N"))
            .Options;
        _db = new AppDbContext(opts);
        _mockHttp = new Mock<IHttpContextAccessor>();
        _authService = new BabyAuthorizationService(_db, _mockHttp.Object);
        _service = new ActivityService(_db, _authService, _mockHttp.Object);
    }

    public async ValueTask DisposeAsync() => await _db.DisposeAsync();

    private void SetUser(string userId, string role)
    {
        var claims = new List<Claim>
        {
            new("sub", userId),
            new(ClaimTypes.NameIdentifier, userId),
            new(ClaimTypes.Role, role),
            new("role", role),
        };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
        _mockHttp.Setup(x => x.HttpContext)
            .Returns(new DefaultHttpContext { User = principal });
    }

    private async Task<string> SeedBabyAsync(string nannyId, string babyName = "TestBaby")
    {
        var baby = new Baby(babyName, new DateOnly(2024, 1, 1), "F", nannyId, nannyId);
        _db.Babies.Add(baby);
        await _db.SaveChangesAsync();
        return baby.Id;
    }

    [Fact]
    public async Task Task16_1_CreateActivity_ShouldAppearInFeed()
    {
        SetUser(NannyId, "Nanny");
        var babyId = await SeedBabyAsync(NannyId);
        var created = await _service.CreateActivityAsync(
            new CreateActivityRequestDto(babyId, ActivityType.Feeding, PhotoUrl, "150ml", null));
        var (items, total) = await _service.GetFeedAsync(0, 20);

        created.BabyId.Should().Be(babyId);
        created.Type.Should().Be(ActivityType.Feeding);
        total.Should().BeGreaterThanOrEqualTo(1);
        items.Should().Contain(a => a.BabyId == babyId && a.Notes == "150ml");
    }

    [Fact]
    public async Task Task16_2_GetSummaries_ThenGetBabyActivities_ShouldWork()
    {
        SetUser(NannyId, "Nanny");
        var babyId = await SeedBabyAsync(NannyId);
        await _service.CreateActivityAsync(new CreateActivityRequestDto(babyId, ActivityType.Feeding, PhotoUrl, "first", null));
        await _service.CreateActivityAsync(new CreateActivityRequestDto(babyId, ActivityType.Sleep, PhotoUrl, "second", null));

        var summaries = await _service.GetBabyActivitySummariesAsync();
        var summary = summaries.FirstOrDefault(s => s.BabyId == babyId);
        summary.Should().NotBeNull("summary should include the test baby");
        summary!.ActivityCount.Should().Be(2);
        summary.BabyName.Should().NotBeNullOrEmpty();

        var activities = await _service.GetBabyActivitiesAsync(babyId, 20);
        activities.Should().HaveCount(2);
        activities.Select(a => a.Type).Should().Contain(ActivityType.Feeding).And.Contain(ActivityType.Sleep);
    }

    [Fact]
    public async Task Task16_3_Feed_ShouldBeOrderedByCreatedAtDesc()
    {
        SetUser(NannyId, "Nanny");
        var babyId = await SeedBabyAsync(NannyId);
        var baseTime = DateTime.UtcNow;
        var older = new Activity(babyId, ActivityType.Feeding, PhotoUrl, "oldest", null, NannyId);
        var middle = new Activity(babyId, ActivityType.Sleep, PhotoUrl, "middle", null, NannyId);
        var newest = new Activity(babyId, ActivityType.Diaper, PhotoUrl, "newest", null, NannyId);
        _db.Activities.AddRange(older, middle, newest);
        await _db.SaveChangesAsync();
        older.CreatedAt = baseTime.AddMinutes(-10);
        middle.CreatedAt = baseTime.AddMinutes(-5);
        newest.CreatedAt = baseTime;
        await _db.SaveChangesAsync();

        var (items, total) = await _service.GetFeedAsync(0, 20);
        total.Should().Be(3);
        for (int i = 0; i < items.Count - 1; i++)
            items[i].CreatedAt.Should().BeOnOrAfter(items[i + 1].CreatedAt, "feed should be ordered by CreatedAt DESC");
        items[0].Notes.Should().Be("newest");
        items[2].Notes.Should().Be("oldest");
    }

    [Fact]
    public async Task Task16_4_OtherNanny_CreateActivity_ShouldThrowUnauthorized()
    {
        SetUser(NannyId, "Nanny");
        var babyId = await SeedBabyAsync(NannyId);
        SetUser(OtherNannyId, "Nanny");
        var req = new CreateActivityRequestDto(babyId, ActivityType.Feeding, PhotoUrl, null, null);
        await Should.ThrowAsync<UnauthorizedAccessException>(() => _service.CreateActivityAsync(req));
    }

    [Fact]
    public async Task Task16_4_SystemAdmin_CanCreateActivityForAnyBaby()
    {
        SetUser(NannyId, "Nanny");
        var babyId = await SeedBabyAsync(NannyId);
        SetUser(AdminId, "SystemAdmin");
        var req = new CreateActivityRequestDto(babyId, ActivityType.Diaper, PhotoUrl, null, null);
        var result = await _service.CreateActivityAsync(req);
        result.Should().NotBeNull();
        result.BabyId.Should().Be(babyId);
    }

    [Fact]
    public async Task Task16_5_Summaries_ShouldBeOrderedByLatestActivityDesc()
    {
        SetUser(NannyId, "Nanny");
        var baby1Id = await SeedBabyAsync(NannyId, "Baby1");
        var baby2Id = await SeedBabyAsync(NannyId, "Baby2");
        var baseTime = DateTime.UtcNow;

        var act1 = new Activity(baby1Id, ActivityType.Feeding, PhotoUrl, null, null, NannyId);
        _db.Activities.Add(act1);
        await _db.SaveChangesAsync();
        act1.CreatedAt = baseTime.AddHours(-2);
        await _db.SaveChangesAsync();

        var act2 = new Activity(baby2Id, ActivityType.Sleep, PhotoUrl, null, null, NannyId);
        _db.Activities.Add(act2);
        await _db.SaveChangesAsync();
        act2.CreatedAt = baseTime.AddHours(-1);
        await _db.SaveChangesAsync();

        var summaries = await _service.GetBabyActivitySummariesAsync();
        var filtered = summaries.Where(s => s.BabyId == baby1Id || s.BabyId == baby2Id).ToList();
        filtered.Should().HaveCount(2);
        filtered[0].BabyId.Should().Be(baby2Id, "baby2 has more recent activity, should be first");
        filtered[1].BabyId.Should().Be(baby1Id);
    }
}