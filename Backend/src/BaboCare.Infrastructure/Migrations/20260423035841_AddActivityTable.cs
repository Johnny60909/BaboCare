using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaboCare.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddActivityTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Activities",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<string>(type: "varchar(26)", nullable: false, comment: "主鍵 (ULID)"),
                    BabyId = table.Column<string>(type: "varchar(26)", nullable: false, comment: "所屬寶寶 ID"),
                    Type = table.Column<int>(type: "int", nullable: false, comment: "活動類型（Feeding=1,Eating=2,Diaper=3,Sleep=4,Mood=5）"),
                    PhotoUrl = table.Column<string>(type: "varchar(500)", nullable: false, comment: "活動照片 URL"),
                    Notes = table.Column<string>(type: "varchar(1000)", nullable: true, comment: "備註文字"),
                    TypeOption = table.Column<int>(type: "int", nullable: true, comment: "類型特定選項值（依 Type 解讀）"),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, comment: "建立時間（UTC）"),
                    CreatedBy = table.Column<string>(type: "varchar(26)", nullable: false, comment: "建立者 ID"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, comment: "最後更新時間（UTC）"),
                    UpdatedBy = table.Column<string>(type: "varchar(26)", nullable: false, comment: "最後更新者 ID")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Activities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Activities_Babies_BabyId",
                        column: x => x.BabyId,
                        principalSchema: "public",
                        principalTable: "Babies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "寶寶活動記錄表");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_BabyId_CreatedAt",
                schema: "public",
                table: "Activities",
                columns: new[] { "BabyId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Activities",
                schema: "public");
        }
    }
}
