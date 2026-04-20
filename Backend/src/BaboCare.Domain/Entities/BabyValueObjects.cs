namespace BaboCare.Domain.Entities;

/// <summary>
/// 性別枚舉
/// </summary>
public enum Gender
{
    Male = 0,
    Female = 1,
    Other = 2
}

/// <summary>
/// 寶寶名字 - 值對象
/// </summary>
public class BabyName
{
    public string FirstName { get; private set; }
    public string? MiddleName { get; private set; }
    public string LastName { get; private set; }

    public BabyName(string firstName, string? middleName, string lastName)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            throw new ArgumentException("FirstName cannot be empty", nameof(firstName));

        if (string.IsNullOrWhiteSpace(lastName))
            throw new ArgumentException("LastName cannot be empty", nameof(lastName));

        FirstName = firstName;
        MiddleName = middleName;
        LastName = lastName;
    }

    /// <summary>
    /// 獲取完整名字
    /// </summary>
    public string GetFullName()
    {
        if (string.IsNullOrEmpty(MiddleName))
        {
            return $"{FirstName} {LastName}";
        }
        return $"{FirstName} {MiddleName} {LastName}";
    }

    public override string ToString() => GetFullName();

    public override bool Equals(object? obj)
    {
        if (obj is not BabyName other)
            return false;

        return FirstName == other.FirstName &&
               MiddleName == other.MiddleName &&
               LastName == other.LastName;
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(FirstName, MiddleName, LastName);
    }
}
