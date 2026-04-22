using BaboCare.Domain.Entities.PendingUsers;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BaboCare.Infrastructure.Persistence.Configurations.PendingUsers;

public class PendingUserConfiguration : IEntityTypeConfiguration<PendingUser>
{
    public void Configure(EntityTypeBuilder<PendingUser> builder)
    {
        builder.ToTable("PendingUsers", t => t.HasComment("待匹配帳號（家長初次登入但未驗證時的暫存資料）"));

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasMaxLength(26).HasComment("主鍵（ULID 格式）");

        builder.Property(x => x.Source).HasComment("帳號來源（Account:自填帳號申請、Email:待 email 驗證、PhoneNumber:待手機驗證）");
        builder.Property(x => x.ProviderKey).HasMaxLength(256).HasComment("第三方登入提供者鑰匙（Google/Line 的用戶 ID，延後 OAuth 時用）");
        builder.Property(x => x.UserName).HasMaxLength(256).HasComment("帳號（使用者自填）");
        builder.Property(x => x.Email).HasMaxLength(256).HasComment("郵箱地址");
        builder.Property(x => x.DisplayName).HasMaxLength(100).HasComment("顯示名稱");
        builder.Property(x => x.AvatarUrl).HasMaxLength(2048).HasComment("頭像 URL");
        builder.Property(x => x.PhoneNumber).HasMaxLength(20).HasComment("手機號碼");
        builder.Property(x => x.PasswordHash).HasMaxLength(512).HasComment("密碼 Hash（僅情境 C 有值）");
        builder.Property(x => x.InviteCode).HasMaxLength(10).HasComment("邀請碼（保母產生的 8 字母碼）");
        builder.Property(x => x.InviteCodeExpiry).HasComment("邀請碼過期時間");
        builder.Property(x => x.CreatedAt).HasComment("建立時間");
    }
}
