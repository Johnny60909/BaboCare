namespace BaboCare.Application.Persistence;

using BaboCare.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

/// <summary>
/// Database context interface for Application layer contracts.
/// Implementation resides in Infrastructure layer (AppDbContext).
/// </summary>
public interface IAppDbContext
{
    DbSet<ApplicationUser> Users { get; }
    DbSet<ApplicationRole> Roles { get; }
    DbSet<PendingUser> PendingUsers { get; }
    DbSet<IdentityUserRole<string>> UserRoles { get; }
    DbSet<IdentityUserLogin<string>> UserLogins { get; }
    DbSet<IdentityRoleClaim<string>> RoleClaims { get; }
    DatabaseFacade Database { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task<IDbContextTransaction> BeginTransactionAsync();
}
