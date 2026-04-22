using BaboCare.Application.Persistence;
using BaboCare.Domain.Abstractions;
using BaboCare.Domain.Entities.Babies;
using BaboCare.Domain.Entities.PendingUsers;
using BaboCare.Domain.Entities.Users;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace BaboCare.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, string>, IAppDbContext
{
    private readonly IHttpContextAccessor? _httpContextAccessor;
    private IDbContextTransaction? _transaction;

    public AppDbContext(DbContextOptions<AppDbContext> options, IHttpContextAccessor? httpContextAccessor = null) : base(options)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public DbSet<PendingUser> PendingUsers => Set<PendingUser>();
    public DbSet<Baby> Babies => Set<Baby>();
    public DbSet<BabyParent> BabyParents => Set<BabyParent>();

    // Expose base DbSets for IAppDbContext
    DbSet<IdentityUserRole<string>> IAppDbContext.UserRoles => Set<IdentityUserRole<string>>();
    DbSet<IdentityUserLogin<string>> IAppDbContext.UserLogins => Set<IdentityUserLogin<string>>();
    DbSet<IdentityRoleClaim<string>> IAppDbContext.RoleClaims => Set<IdentityRoleClaim<string>>();

    public async Task<IDbContextTransaction> BeginTransactionAsync()
    {
        return await Database.BeginTransactionAsync();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // 自動填充審計欄位
        var now = DateTime.UtcNow;
        var userId = GetCurrentUserId();

        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is IAuditable && (e.State == EntityState.Added || e.State == EntityState.Modified))
            .ToList();

        foreach (var entry in entries)
        {
            var auditable = entry.Entity as IAuditable;
            if (auditable == null) continue;

            if (entry.State == EntityState.Added)
            {
                auditable.CreatedAt = now;
                auditable.CreatedBy = userId;
            }

            auditable.UpdatedAt = now;
            auditable.UpdatedBy = userId;
        }

        return await base.SaveChangesAsync(cancellationToken);
    }

    private string GetCurrentUserId()
    {
        var httpContext = _httpContextAccessor?.HttpContext;
        if (httpContext?.User?.FindFirst("sub") is { } claim)
        {
            return claim.Value;
        }

        return "system";
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
