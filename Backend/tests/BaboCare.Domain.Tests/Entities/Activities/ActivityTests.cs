using BaboCare.Domain.Entities.Activities;
using FluentAssertions;
using Shouldly;
using Xunit;

namespace BaboCare.Domain.Tests.Entities.Activities;

public class ActivityTests
{
    private const string BabyId = "01HZZZZZZZZZZZZZZZZZZZZZZZ";
    private const string UserId = "01HYYYYYYYYYYYYYYYYYYYYYYYY";

    [Fact]
    public void Constructor_ShouldInitializePropertiesCorrectly()
    {
        // Arrange & Act
        var activity = new Activity(BabyId, ActivityType.Feeding, "https://example.com/photo.jpg", "備註", null, UserId);

        // Assert
        activity.Id.ShouldNotBeNull();
        activity.Id.Length.ShouldBe(26); // ULID
        activity.BabyId.ShouldBe(BabyId);
        activity.Type.ShouldBe(ActivityType.Feeding);
        activity.PhotoUrl.ShouldBe("https://example.com/photo.jpg");
        activity.Notes.ShouldBe("備註");
        activity.TypeOption.ShouldBeNull();
        activity.CreatedBy.ShouldBe(UserId);
        activity.UpdatedBy.ShouldBe(UserId);
        activity.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Constructor_WithValidEatingOption_ShouldSucceed()
    {
        // Act
        var act = () => new Activity(BabyId, ActivityType.Eating, "https://example.com/photo.jpg", null, (int)EatingOption.Supplementary, UserId);

        // Assert
        act.Should().NotThrow();
    }

    [Fact]
    public void Constructor_WithInvalidEatingOption_ShouldThrow()
    {
        // Act
        var act = () => new Activity(BabyId, ActivityType.Eating, "https://example.com/photo.jpg", null, 999, UserId);

        // Assert
        act.Should().Throw<ArgumentException>().WithMessage("*進食選項值無效*");
    }

    [Fact]
    public void Constructor_WithValidMoodOption_ShouldSucceed()
    {
        // Act
        var act = () => new Activity(BabyId, ActivityType.Mood, "https://example.com/photo.jpg", null, (int)MoodOption.Outing, UserId);

        // Assert
        act.Should().NotThrow();
    }

    [Fact]
    public void Constructor_WithInvalidMoodOption_ShouldThrow()
    {
        // Act
        var act = () => new Activity(BabyId, ActivityType.Mood, "https://example.com/photo.jpg", null, 999, UserId);

        // Assert
        act.Should().Throw<ArgumentException>().WithMessage("*心情選項值無效*");
    }

    [Theory]
    [InlineData(ActivityType.Feeding)]
    [InlineData(ActivityType.Diaper)]
    [InlineData(ActivityType.Sleep)]
    public void Constructor_SimpleTypes_IgnoreTypeOption(ActivityType type)
    {
        // Act - 簡單類型即使提供 TypeOption 也不報錯
        var act = () => new Activity(BabyId, type, "https://example.com/photo.jpg", null, null, UserId);

        // Assert
        act.Should().NotThrow();
    }

    [Fact]
    public void TwoActivities_ShouldHaveDifferentIds()
    {
        // Act
        var a1 = new Activity(BabyId, ActivityType.Feeding, "https://example.com/photo.jpg", null, null, UserId);
        var a2 = new Activity(BabyId, ActivityType.Feeding, "https://example.com/photo.jpg", null, null, UserId);

        // Assert
        a1.Id.ShouldNotBe(a2.Id);
    }
}
