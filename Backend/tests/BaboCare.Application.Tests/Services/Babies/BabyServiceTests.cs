using BaboCare.Application.Dtos.Babies;
using BaboCare.Application.Persistence;
using BaboCare.Application.Services;
using BaboCare.Domain.Entities.Babies;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Moq;
using Shouldly;
using Xunit;

namespace BaboCare.Application.Tests.Services.Babies;

public class BabyServiceTests
{
    private readonly Mock<IAppDbContext> _mockDbContext;
    private readonly Mock<IFileStorageService> _mockFileStorageService;
    private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
    private readonly BabyService _babyService;
    private readonly BabyAuthorizationService _authService;

    public BabyServiceTests()
    {
        _mockDbContext = new Mock<IAppDbContext>();
        _mockFileStorageService = new Mock<IFileStorageService>();
        _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();

        // Create real BabyAuthorizationService instance with mocked dependencies
        _authService = new BabyAuthorizationService(_mockDbContext.Object, _mockHttpContextAccessor.Object);

        _babyService = new BabyService(
            _mockDbContext.Object,
            _authService,
            _mockFileStorageService.Object,
            _mockHttpContextAccessor.Object);
    }

    [Fact]
    public async Task GetAllBabiesAsync_ShouldReturnAllBabies()
    {
        // Arrange
        var babies = new List<Baby>
        {
            new Baby("寶寶1", new DateOnly(2024, 1, 15), "男", "nanny_1", "user_1"),
            new Baby("寶寶2", new DateOnly(2024, 2, 20), "女", "nanny_2", "user_2")
        };

        var mockDbSet = GetMockDbSet(babies);
        _mockDbContext.Setup(x => x.Babies).Returns(mockDbSet.Object);

        // Act
        var result = await _babyService.GetAllBabiesAsync();

        // Assert
        result.ShouldNotBeNull();
        result.Count.ShouldBeGreaterThanOrEqualTo(2);
    }

    [Fact]
    public async Task GetBabyByIdAsync_WithValidId_ShouldReturnBaby()
    {
        // Arrange
        var baby = new Baby("小寶寶", new DateOnly(2024, 1, 15), "男", "nanny_123", "user_1");
        var babies = new List<Baby> { baby };

        var mockDbSet = GetMockDbSet(babies);
        _mockDbContext.Setup(x => x.Babies).Returns(mockDbSet.Object);

        // Act
        var result = await _babyService.GetBabyByIdAsync(baby.Id);

        // Assert
        result.ShouldNotBeNull();
        result?.Name.ShouldBe("小寶寶");
    }

    [Fact]
    public async Task GetBabyByIdAsync_WithInvalidId_ShouldReturnNull()
    {
        // Arrange
        var babies = new List<Baby>();
        var mockDbSet = GetMockDbSet(babies);
        _mockDbContext.Setup(x => x.Babies).Returns(mockDbSet.Object);

        // Act
        var result = await _babyService.GetBabyByIdAsync("invalid_id_123456789012345");

        // Assert
        result.ShouldBeNull();
    }

    // Helper method to create mock DbSet
    private Mock<DbSet<Baby>> GetMockDbSet(List<Baby> sourceList)
    {
        var queryable = sourceList.AsQueryable();
        var mockDbSet = new Mock<DbSet<Baby>>();

        mockDbSet.As<IQueryable<Baby>>().Setup(m => m.Provider).Returns(queryable.Provider);
        mockDbSet.As<IQueryable<Baby>>().Setup(m => m.Expression).Returns(queryable.Expression);
        mockDbSet.As<IQueryable<Baby>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
        mockDbSet.As<IQueryable<Baby>>().Setup(m => m.GetEnumerator()).Returns(queryable.GetEnumerator());
        mockDbSet.As<IAsyncEnumerable<Baby>>()
            .Setup(m => m.GetAsyncEnumerator(It.IsAny<CancellationToken>()))
            .Returns(new AsyncEnumerator<Baby>(queryable.GetEnumerator()));

        return mockDbSet;
    }
}

// Helper class for async enumeration
public class AsyncEnumerator<T> : IAsyncEnumerator<T>
{
    private readonly IEnumerator<T> _enumerator;

    public AsyncEnumerator(IEnumerator<T> enumerator)
    {
        _enumerator = enumerator;
    }

    public T Current => _enumerator.Current;

    public async ValueTask<bool> MoveNextAsync()
    {
        return await Task.FromResult(_enumerator.MoveNext());
    }

    public async ValueTask DisposeAsync()
    {
        _enumerator?.Dispose();
        await Task.CompletedTask;
    }
}
