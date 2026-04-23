using BaboCare.Domain.Entities.Activities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BaboCare.Infrastructure.Persistence.Configurations.Activities;

public class ActivityConfiguration : IEntityTypeConfiguration<Activity>
{
    public void Configure(EntityTypeBuilder<Activity> builder)
    {
        builder.ToTable("Activities", schema: "public");
        builder.HasComment("寶寶活動記錄表");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id)
            .HasColumnType("varchar(26)")
            .IsRequired()
            .HasComment("主鍵 (ULID)");

        builder.Property(a => a.BabyId)
            .HasColumnType("varchar(26)")
            .IsRequired()
            .HasComment("所屬寶寶 ID");

        builder.Property(a => a.Type)
            .HasColumnType("int")
            .IsRequired()
            .HasComment("活動類型（Feeding=1,Eating=2,Diaper=3,Sleep=4,Mood=5）");

        builder.Property(a => a.PhotoUrl)
            .HasColumnType("varchar(500)")
            .IsRequired()
            .HasComment("活動照片 URL");

        builder.Property(a => a.Notes)
            .HasColumnType("varchar(1000)")
            .HasComment("備註文字");

        builder.Property(a => a.TypeOption)
            .HasColumnType("int")
            .HasComment("類型特定選項值（依 Type 解讀）");

        builder.Property(a => a.CreatedAt)
            .HasColumnType("timestamp with time zone")
            .IsRequired()
            .HasComment("建立時間（UTC）");

        builder.Property(a => a.CreatedBy)
            .HasColumnType("varchar(26)")
            .IsRequired()
            .HasComment("建立者 ID");

        builder.Property(a => a.UpdatedAt)
            .HasColumnType("timestamp with time zone")
            .IsRequired()
            .HasComment("最後更新時間（UTC）");

        builder.Property(a => a.UpdatedBy)
            .HasColumnType("varchar(26)")
            .IsRequired()
            .HasComment("最後更新者 ID");

        // 索引：加速依寶寶 ID + 時間排序查詢
        builder.HasIndex(a => new { a.BabyId, a.CreatedAt })
            .HasDatabaseName("IX_Activities_BabyId_CreatedAt");

        // 導航屬性
        builder.HasOne(a => a.Baby)
            .WithMany()
            .HasForeignKey(a => a.BabyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
