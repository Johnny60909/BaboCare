using BaboCare.Domain.Entities.Babies;
using FluentAssertions;
using Shouldly;
using Xunit;

namespace BaboCare.Domain.Tests.Entities.Babies;

public class BabyTests
{
    [Fact]
    public void Constructor_ShouldInitializePropertiesCorrectly()
    {
        // Arrange
        var name = "小寶寶";
        var dateOfBirth = new DateOnly(2024, 1, 15);
        var gender = "男";
        var nannyId = "nanny_123";
        var createdBy = "user_456";

        // Act
        var baby = new Baby(name, dateOfBirth, gender, nannyId, createdBy);

        // Assert
        baby.Name.ShouldBe(name);
        baby.DateOfBirth.ShouldBe(dateOfBirth);
        baby.Gender.ShouldBe(gender);
        baby.NannyId.ShouldBe(nannyId);
        baby.CreatedBy.ShouldBe(createdBy);
        baby.UpdatedBy.ShouldBe(createdBy);
        baby.Id.ShouldNotBeNull();
        baby.Id.Length.ShouldBe(26); // ULID 長度為 26
        baby.AvatarUrl.ShouldBeNull();
        baby.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        baby.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Update_ShouldModifyProperties()
    {
        // Arrange
        var baby = new Baby("原名", new DateOnly(2024, 1, 15), "男", "nanny_123", "user_1");
        var newName = "新名字";
        var newDateOfBirth = new DateOnly(2024, 2, 20);
        var newGender = "女";
        var newNannyId = "nanny_456";
        var updatedBy = "user_2";
        var originalCreatedAt = baby.CreatedAt;

        // Act
        baby.Update(newName, newDateOfBirth, newGender, newNannyId, updatedBy);

        // Assert
        baby.Name.ShouldBe(newName);
        baby.DateOfBirth.ShouldBe(newDateOfBirth);
        baby.Gender.ShouldBe(newGender);
        baby.NannyId.ShouldBe(newNannyId);
        baby.UpdatedBy.ShouldBe(updatedBy);
        baby.CreatedAt.ShouldBe(originalCreatedAt);
        baby.CreatedBy.ShouldBe("user_1");
        baby.UpdatedAt.ShouldBeGreaterThanOrEqualTo(originalCreatedAt);
    }

    [Fact]
    public void SetAvatarUrl_ShouldUpdateAvatarUrl()
    {
        // Arrange
        var baby = new Baby("小寶寶", new DateOnly(2024, 1, 15), "男", null, "user_1");
        var avatarUrl = "https://example.com/avatar.jpg";
        var updatedBy = "user_2";

        // Act
        baby.SetAvatarUrl(avatarUrl, updatedBy);

        // Assert
        baby.AvatarUrl.ShouldBe(avatarUrl);
        baby.UpdatedBy.ShouldBe(updatedBy);
        baby.UpdatedAt.ShouldBeGreaterThan(baby.CreatedAt);
    }

    [Fact]
    public void SetAvatarUrl_ShouldClearAvatarUrl()
    {
        // Arrange
        var baby = new Baby("小寶寶", new DateOnly(2024, 1, 15), "男", null, "user_1");
        baby.SetAvatarUrl("https://example.com/avatar.jpg", "user_1");
        var originalAvatarUrl = baby.AvatarUrl;

        // Act
        baby.SetAvatarUrl(null, "user_2");

        // Assert
        baby.AvatarUrl.ShouldBeNull();
        originalAvatarUrl.ShouldNotBeNull();
    }

    [Fact]
    public void Parents_ShouldBeInitializedAsEmptyCollection()
    {
        // Arrange & Act
        var baby = new Baby("小寶寶", new DateOnly(2024, 1, 15), "男", null, "user_1");

        // Assert
        baby.Parents.ShouldNotBeNull();
        baby.Parents.Count.ShouldBe(0);
    }
}
