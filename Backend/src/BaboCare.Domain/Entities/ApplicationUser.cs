using Microsoft.AspNetCore.Identity;

namespace BaboCare.Domain.Entities;

public class ApplicationUser : IdentityUser<string>
{
    public ApplicationUser()
    {
        Id = Ulid.NewUlid().ToString();
    }
}
