namespace BaboCare.Domain.Entities.Activities;

/// <summary>
/// 寶寶活動類型
/// </summary>
public enum ActivityType
{
    /// <summary>餵奶</summary>
    Feeding = 1,

    /// <summary>進食</summary>
    Eating = 2,

    /// <summary>換尿布</summary>
    Diaper = 3,

    /// <summary>睡眠</summary>
    Sleep = 4,

    /// <summary>心情</summary>
    Mood = 5
}

/// <summary>
/// 進食選項
/// </summary>
public enum EatingOption
{
    /// <summary>副食品</summary>
    Supplementary = 1,

    /// <summary>午餐</summary>
    Lunch = 2
}

/// <summary>
/// 心情選項
/// </summary>
public enum MoodOption
{
    /// <summary>出遊</summary>
    Outing = 1,

    /// <summary>玩遊戲</summary>
    Playing = 2,

    /// <summary>不開心</summary>
    Unhappy = 3
}
