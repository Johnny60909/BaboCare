using BaboCare.Application.Services;
using BaboCare.Domain.Entities.Babies;
using BaboCare.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Moq;
using Shouldly;
using System.Security.Claims;
using Xunit;

namespace BaboCare.Application.Tests.Services.Babies;

public class BabyServiceTests : IAsyncDisposable
{
    private readonly AppDbContext _dbContext;
    private readonly Mock<IFileStorageService> _mockFileStorageService;
    private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
    private readonly BabyService _babyService;
    private readonly BabyAuthorizationService _authService;

    public BabyServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _dbContext = new AppDbContext(options);

        _mockFileStorageService = new Mock<IFileStorageService>();
        _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();

        var claims = new List<Claim>
        {
            new Claim("sub", "test_admin_id"),
            new Claim("role", "SystemAdmin"),
            new Claim(ClaimTypes.Role, "SystemAdmin")
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);
        _mockHttpContextAccessor.Setup(x => x.HttpContext)
            .Returns(new DefaultHttpContext { User = principal });

        _authService = new BabyAuthorizationService(_dbContext, _mockHttpContextAccessor.Object);

        _babyService = new BabyService(
            _dbContext,
            _authService,
            _mockFileStorageService.Object,
            _mockHttpContextAccessor.Object);
    }

    public async ValueTask DisposeAsync() => await _dbContext.DisposeAsync();

    [Fact]
    public async Task GetAllBabiesAsync_ShouldReturnAllBabies()
    {
        // Arrange
        _dbContext.Babies.AddRange(
            new Baby("寶寶1", new DateOnly(2024, 1, 15), "男", "nanny_1", "user_1"),
            new Baby("寶寶2", new DateOnly(2024, 2, 20), "女", "nanny_2", "user_2"));
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _babyService.GetAllBabiesAsync();

        // Assert
        result.ShouldNotBeNull();
        result.Count.ShouldBe(2);
    }

    [Fact]
    public async Task GetBabyByIdAsync_WithValidId_ShouldReturnBaby()
    {
        // Arrange
        var baby = new Baby("小寶寶", new DateOnly(2024, 1, 15), "男", "nanny_123", "user_1");
        _dbContext.Babies.Add(baby);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _babyService.GetBabyByIdAsync(baby.Id);

        // Assert
        result.ShouldNotBeNull();
        result!.Name.ShouldBe("小寶寶");
    }

    [Fact]
    public async Task GetBabyByIdAsync_WithInvalidId_ShouldReturnNull()
    {
        // Act
        var result = await _babyService.GetBabyByIdAsync("invalid_id_123456789012345");

        // Assert
        result.ShouldBeNull();
    }
}
