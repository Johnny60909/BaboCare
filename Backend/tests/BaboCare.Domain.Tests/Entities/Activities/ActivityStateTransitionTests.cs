using AwesomeAssertions;
using BaboCare.Domain.Entities.Activities;
using Xunit;

namespace BaboCare.Domain.Tests.Entities.Activities;

/// <summary>
/// Activity 狀態轉換測試 - 使用 AwesomeAssertions 驗證
/// </summary>
public class ActivityStateTransitionTests
{
    private const string BabyId = "01HZZZZZZZZZZZZZZZZZZZZZZZ";
    private const string UserId = "01HYYYYYYYYYYYYYYYYYYYYYYYY";
    private const string PhotoUrl = "https://example.com/photo.jpg";

    // ─── 初始狀態驗證 ───────────────────────────────────────────────────────

    [Fact]
    public void NewActivity_ShouldHaveValidUlid()
    {
        var activity = new Activity(BabyId, ActivityType.Feeding, PhotoUrl, null, null, UserId);

        activity.Id.Should().NotBeNull();
        activity.Id.Should().HaveLength(26); // ULID = 26 chars
    }

    [Fact]
    public void NewActivity_ShouldSetAuditFields()
    {
        var before = DateTime.UtcNow;
        var activity = new Activity(BabyId, ActivityType.Feeding, PhotoUrl, null, null, UserId);

        activity.CreatedBy.Should().Be(UserId);
        activity.UpdatedBy.Should().Be(UserId);
        activity.CreatedAt.Should().BeOnOrAfter(before);
        activity.UpdatedAt.Should().BeOnOrAfter(before);
    }

    [Fact]
    public void NewActivity_CreatedAtAndUpdatedAt_ShouldBeNearlyEqual()
    {
        var activity = new Activity(BabyId, ActivityType.Feeding, PhotoUrl, null, null, UserId);

        // 建構子呼叫兩次 DateTime.UtcNow，允許 1ms 誤差
        activity.CreatedAt.Should().BeCloseTo(activity.UpdatedAt, TimeSpan.FromMilliseconds(1));
    }

    // ─── 有效狀態轉換（含 TypeOption） ─────────────────────────────────────

    [Theory]
    [InlineData(ActivityType.Feeding, null)]
    [InlineData(ActivityType.Diaper, null)]
    [InlineData(ActivityType.Sleep, null)]
    [InlineData(ActivityType.Eating, (int)EatingOption.Supplementary)]
    [InlineData(ActivityType.Eating, (int)EatingOption.Lunch)]
    [InlineData(ActivityType.Mood, (int)MoodOption.Outing)]
    [InlineData(ActivityType.Mood, (int)MoodOption.Playing)]
    [InlineData(ActivityType.Mood, (int)MoodOption.Unhappy)]
    public void ValidTypeOptionCombination_ShouldTransitionToCreatedState(ActivityType type, int? typeOption)
    {
        var act = () => new Activity(BabyId, type, PhotoUrl, null, typeOption, UserId);

        act.Should().NotThrow();
    }

    // ─── 無效狀態轉換 ───────────────────────────────────────────────────────

    [Fact]
    public void EatingActivity_WithInvalidTypeOption_ShouldRemainInInvalidState()
    {
        var act = () => new Activity(BabyId, ActivityType.Eating, PhotoUrl, null, 999, UserId);

        act.Should().Throw<ArgumentException>()
           .WithMessage("*進食選項值無效*");
    }

    [Fact]
    public void MoodActivity_WithInvalidTypeOption_ShouldRemainInInvalidState()
    {
        var act = () => new Activity(BabyId, ActivityType.Mood, PhotoUrl, null, 999, UserId);

        act.Should().Throw<ArgumentException>()
           .WithMessage("*心情選項值無效*");
    }

    [Fact]
    public void EatingActivity_WithNegativeTypeOption_ShouldRemainInInvalidState()
    {
        var act = () => new Activity(BabyId, ActivityType.Eating, PhotoUrl, null, -1, UserId);

        act.Should().Throw<ArgumentException>();
    }

    // ─── 兩個活動的 ULID 唯一性 ─────────────────────────────────────────────

    [Fact]
    public void TwoActivities_ShouldHaveDifferentIds()
    {
        var a1 = new Activity(BabyId, ActivityType.Feeding, PhotoUrl, null, null, UserId);
        var a2 = new Activity(BabyId, ActivityType.Feeding, PhotoUrl, null, null, UserId);

        a1.Id.Should().NotBe(a2.Id);
    }

    // ─── Notes 可選狀態 ─────────────────────────────────────────────────────

    [Fact]
    public void Activity_WithNullNotes_ShouldBeInValidState()
    {
        var activity = new Activity(BabyId, ActivityType.Feeding, PhotoUrl, null, null, UserId);

        activity.Notes.Should().BeNull();
    }

    [Fact]
    public void Activity_WithNotes_ShouldPreserveNotesState()
    {
        const string notes = "今天喝了 120ml 的奶";
        var activity = new Activity(BabyId, ActivityType.Feeding, PhotoUrl, notes, null, UserId);

        activity.Notes.Should().Be(notes);
    }
}
