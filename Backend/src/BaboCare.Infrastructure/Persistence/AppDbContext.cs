using BaboCare.Application.Persistence;
using BaboCare.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace BaboCare.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, string>, IAppDbContext
{
    private IDbContextTransaction? _transaction;

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<PendingUser> PendingUsers => Set<PendingUser>();

    // Expose base DbSets for IAppDbContext
    DbSet<IdentityUserRole<string>> IAppDbContext.UserRoles => Set<IdentityUserRole<string>>();
    DbSet<IdentityUserLogin<string>> IAppDbContext.UserLogins => Set<IdentityUserLogin<string>>();
    DbSet<IdentityRoleClaim<string>> IAppDbContext.RoleClaims => Set<IdentityRoleClaim<string>>();

    public async Task<IDbContextTransaction> BeginTransactionAsync()
    {
        return await Database.BeginTransactionAsync();
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
