using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaboCare.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Up_Account_About : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterTable(
                name: "AspNetUsers",
                comment: "應用程式使用者帳號");

            migrationBuilder.AlterTable(
                name: "AspNetRoles",
                comment: "應用程式角色");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "AspNetUserTokens",
                type: "character varying(26)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Id",
                table: "AspNetUsers",
                type: "character varying(26)",
                maxLength: 26,
                nullable: false,
                comment: "使用者唯一識別碼（ULID 格式）",
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "DisplayName",
                table: "AspNetUsers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                comment: "使用者顯示名稱");

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                table: "AspNetUsers",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true,
                comment: "性別");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "AspNetUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                comment: "帳號是否啟用（false 表示停用）");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "AspNetUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                comment: "帳號是否刪除（軟刪除標記）");

            migrationBuilder.AlterColumn<string>(
                name: "RoleId",
                table: "AspNetUserRoles",
                type: "character varying(26)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "AspNetUserRoles",
                type: "character varying(26)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "AspNetUserLogins",
                type: "character varying(26)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "AspNetUserClaims",
                type: "character varying(26)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "NormalizedName",
                table: "AspNetRoles",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                comment: "角色名稱（大寫，用於查詢）",
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "AspNetRoles",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                comment: "角色名稱",
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ConcurrencyStamp",
                table: "AspNetRoles",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                comment: "並行檢查戳記",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Id",
                table: "AspNetRoles",
                type: "character varying(26)",
                maxLength: 26,
                nullable: false,
                comment: "角色唯一識別碼（ULID 格式）",
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "RoleId",
                table: "AspNetRoleClaims",
                type: "character varying(26)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateTable(
                name: "PendingUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(26)", maxLength: 26, nullable: false, comment: "主鍵（ULID 格式）"),
                    Source = table.Column<int>(type: "integer", nullable: false, comment: "帳號來源（Account:自填帳號申請、Email:待 email 驗證、PhoneNumber:待手機驗證）"),
                    ProviderKey = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true, comment: "第三方登入提供者鑰匙（Google/Line 的用戶 ID，延後 OAuth 時用）"),
                    UserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true, comment: "帳號（使用者自填）"),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true, comment: "郵箱地址"),
                    DisplayName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true, comment: "顯示名稱"),
                    AvatarUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true, comment: "頭像 URL"),
                    PhoneNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true, comment: "手機號碼"),
                    PasswordHash = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true, comment: "密碼 Hash（僅情境 C 有值）"),
                    InviteCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true, comment: "邀請碼（保母產生的 8 字母碼）"),
                    InviteCodeExpiry = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, comment: "邀請碼過期時間"),
                    InviteCodeAttempts = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, comment: "建立時間")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PendingUsers", x => x.Id);
                },
                comment: "待匹配帳號（家長初次登入但未驗證時的暫存資料）");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PendingUsers");

            migrationBuilder.DropColumn(
                name: "DisplayName",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Gender",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "AspNetUsers");

            migrationBuilder.AlterTable(
                name: "AspNetUsers",
                oldComment: "應用程式使用者帳號");

            migrationBuilder.AlterTable(
                name: "AspNetRoles",
                oldComment: "應用程式角色");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "AspNetUserTokens",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(26)");

            migrationBuilder.AlterColumn<string>(
                name: "Id",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(26)",
                oldMaxLength: 26,
                oldComment: "使用者唯一識別碼（ULID 格式）");

            migrationBuilder.AlterColumn<string>(
                name: "RoleId",
                table: "AspNetUserRoles",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(26)");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "AspNetUserRoles",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(26)");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "AspNetUserLogins",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(26)");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "AspNetUserClaims",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(26)");

            migrationBuilder.AlterColumn<string>(
                name: "NormalizedName",
                table: "AspNetRoles",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true,
                oldComment: "角色名稱（大寫，用於查詢）");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "AspNetRoles",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true,
                oldComment: "角色名稱");

            migrationBuilder.AlterColumn<string>(
                name: "ConcurrencyStamp",
                table: "AspNetRoles",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true,
                oldComment: "並行檢查戳記");

            migrationBuilder.AlterColumn<string>(
                name: "Id",
                table: "AspNetRoles",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(26)",
                oldMaxLength: 26,
                oldComment: "角色唯一識別碼（ULID 格式）");

            migrationBuilder.AlterColumn<string>(
                name: "RoleId",
                table: "AspNetRoleClaims",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(26)");
        }
    }
}
