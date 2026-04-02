using BaboCare.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BaboCare.Infrastructure.Persistence.Configurations;

public class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.ToTable("AspNetUsers", t => t.HasComment("應用程式使用者帳號"));

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasMaxLength(26).HasComment("使用者唯一識別碼（ULID 格式）");

        builder.Property(x => x.DisplayName).HasMaxLength(100).HasComment("使用者顯示名稱");
        builder.Property(x => x.Gender).HasMaxLength(10).HasComment("性別");
        builder.Property(x => x.IsActive).HasComment("帳號是否啟用（false 表示停用）");
        builder.Property(x => x.IsDeleted).HasComment("帳號是否刪除（軟刪除標記）");
    }
}
