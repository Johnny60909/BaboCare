using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BaboCare.Domain.Entities;

namespace BaboCare.Infrastructure.Persistence;

public class BabyParentConfiguration : IEntityTypeConfiguration<BabyParent>
{
    public void Configure(EntityTypeBuilder<BabyParent> builder)
    {
        builder.HasKey(bp => bp.Id);

        builder.Property(bp => bp.Id)
            .HasColumnType("varchar(26)")
            .IsRequired();

        builder.Property(bp => bp.BabyId)
            .HasColumnType("varchar(26)")
            .IsRequired();

        builder.Property(bp => bp.ParentId)
            .HasColumnType("varchar(26)")
            .IsRequired();

        builder.Property(bp => bp.CreatedAt)
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        builder.Property(bp => bp.CreatedBy)
            .HasColumnType("varchar(26)")
            .IsRequired();

        builder.Property(bp => bp.UpdatedAt)
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        builder.Property(bp => bp.UpdatedBy)
            .HasColumnType("varchar(26)")
            .IsRequired();

        // 配置外鍵關係
        builder.HasOne(bp => bp.Baby)
            .WithMany(b => b.Parents)
            .HasForeignKey(bp => bp.BabyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(bp => bp.Parent)
            .WithMany()
            .HasForeignKey(bp => bp.ParentId)
            .OnDelete(DeleteBehavior.Cascade);

        // 添加複合唯一索引，防止重複關聯
        builder.HasIndex(bp => new { bp.BabyId, bp.ParentId })
            .IsUnique()
            .HasDatabaseName("IX_BabyParent_BabyId_ParentId");

        builder.ToTable("BabyParents", schema: "public");
    }
}
