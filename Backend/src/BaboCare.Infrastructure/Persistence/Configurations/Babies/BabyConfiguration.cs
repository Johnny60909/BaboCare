using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BaboCare.Domain.Entities.Babies;
using BaboCare.Domain.Entities.Users;

namespace BaboCare.Infrastructure.Persistence.Configurations.Babies;

public class BabyConfiguration : IEntityTypeConfiguration<Baby>
{
    public void Configure(EntityTypeBuilder<Baby> builder)
    {
        builder.ToTable("Babies", schema: "public");
        builder.HasComment("嬰兒基本資料表");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.Id)
            .HasColumnType("varchar(26)")
            .IsRequired()
            .HasComment("主鍵 (ULID)");

        builder.Property(b => b.Name)
            .HasColumnType("varchar(255)")
            .IsRequired()
            .HasComment("嬰兒姓名");

        builder.Property(b => b.DateOfBirth)
            .HasColumnType("date")
            .IsRequired()
            .HasComment("出生日期");

        builder.Property(b => b.Gender)
            .HasColumnType("varchar(50)")
            .HasComment("性別");

        builder.Property(b => b.NannyId)
            .HasColumnType("varchar(26)")
            .HasComment("負責的保母 ID");

        builder.Property(b => b.AvatarUrl)
            .HasColumnType("varchar(500)")
            .HasComment("大頭照 URL");

        builder.Property(b => b.CreatedAt)
            .HasColumnType("timestamp with time zone")
            .IsRequired()
            .HasComment("建立時間");

        builder.Property(b => b.CreatedBy)
            .HasColumnType("varchar(26)")
            .IsRequired()
            .HasComment("建立者 ID");

        builder.Property(b => b.UpdatedAt)
            .HasColumnType("timestamp with time zone")
            .IsRequired()
            .HasComment("最後更新時間");

        builder.Property(b => b.UpdatedBy)
            .HasColumnType("varchar(26)")
            .IsRequired()
            .HasComment("最後更新者 ID");

        // 配置與 BabyParent 的一對多關係
        builder.HasMany(b => b.Parents)
            .WithOne(bp => bp.Baby)
            .HasForeignKey(bp => bp.BabyId)
            .OnDelete(DeleteBehavior.NoAction);

        // 配置與 Nanny (ApplicationUser) 的外鍵關係
        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(b => b.NannyId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired(false);
    }
}
