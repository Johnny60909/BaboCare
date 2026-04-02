using BaboCare.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BaboCare.Infrastructure.Persistence.Configurations;

public class ApplicationRoleConfiguration : IEntityTypeConfiguration<ApplicationRole>
{
    public void Configure(EntityTypeBuilder<ApplicationRole> builder)
    {
        builder.ToTable("AspNetRoles", t => t.HasComment("應用程式角色"));

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasMaxLength(26).HasComment("角色唯一識別碼（ULID 格式）");

        builder.Property(x => x.Name).HasMaxLength(256).HasComment("角色名稱");
        builder.Property(x => x.NormalizedName).HasMaxLength(256).HasComment("角色名稱（大寫，用於查詢）");
        builder.Property(x => x.ConcurrencyStamp).HasMaxLength(50).HasComment("並行檢查戳記");
    }
}
