using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BaboCare.Domain.Entities;

namespace BaboCare.Infrastructure.Persistence;

public class BabyConfiguration : IEntityTypeConfiguration<Baby>
{
    public void Configure(EntityTypeBuilder<Baby> builder)
    {
        builder.HasKey(b => b.Id);

        builder.Property(b => b.Id)
            .HasColumnType("varchar(26)")
            .IsRequired();

        builder.Property(b => b.Name)
            .HasColumnType("varchar(255)")
            .IsRequired();

        builder.Property(b => b.DateOfBirth)
            .HasColumnType("date")
            .IsRequired();

        builder.Property(b => b.Gender)
            .HasColumnType("varchar(50)");

        builder.Property(b => b.NannyId)
            .HasColumnType("varchar(26)");

        builder.Property(b => b.AvatarUrl)
            .HasColumnType("varchar(500)");

        builder.Property(b => b.CreatedAt)
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        builder.Property(b => b.CreatedBy)
            .HasColumnType("varchar(26)")
            .IsRequired();

        builder.Property(b => b.UpdatedAt)
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        builder.Property(b => b.UpdatedBy)
            .HasColumnType("varchar(26)")
            .IsRequired();

        // 配置與 BabyParent 的一對多關係
        builder.HasMany(b => b.Parents)
            .WithOne(bp => bp.Baby)
            .HasForeignKey(bp => bp.BabyId)
            .OnDelete(DeleteBehavior.Cascade);

        // 配置與 Nanny (ApplicationUser) 的外鍵關係
        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(b => b.NannyId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.ToTable("Babies", schema: "public");
    }
}
