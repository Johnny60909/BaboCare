using Microsoft.AspNetCore.Identity;

namespace BaboCare.Domain.Entities;

public class ApplicationUser : IdentityUser<string>
{
    public ApplicationUser()
    {
        Id = Ulid.NewUlid().ToString();
    }

    public string? DisplayName { get; set; }
    public string? Gender { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
