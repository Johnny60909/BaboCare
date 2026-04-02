using Microsoft.AspNetCore.Identity;

namespace BaboCare.Domain.Entities;

public class ApplicationRole : IdentityRole<string>
{
    public ApplicationRole()
    {
        Id = Ulid.NewUlid().ToString();
    }

    public ApplicationRole(string roleName) : this()
    {
        Name = roleName;
    }
}
