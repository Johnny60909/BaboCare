using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaboCare.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBabyAndBabyParentTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "public");

            migrationBuilder.CreateTable(
                name: "Babies",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<string>(type: "varchar(26)", nullable: false),
                    Name = table.Column<string>(type: "varchar(255)", nullable: false),
                    DateOfBirth = table.Column<DateOnly>(type: "date", nullable: false),
                    Gender = table.Column<string>(type: "varchar(50)", nullable: true),
                    NannyId = table.Column<string>(type: "varchar(26)", nullable: true),
                    AvatarUrl = table.Column<string>(type: "varchar(500)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(26)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedBy = table.Column<string>(type: "varchar(26)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Babies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Babies_AspNetUsers_NannyId",
                        column: x => x.NannyId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "BabyParents",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<string>(type: "varchar(26)", nullable: false),
                    BabyId = table.Column<string>(type: "varchar(26)", nullable: false),
                    ParentId = table.Column<string>(type: "varchar(26)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(26)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedBy = table.Column<string>(type: "varchar(26)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BabyParents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BabyParents_AspNetUsers_ParentId",
                        column: x => x.ParentId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BabyParents_Babies_BabyId",
                        column: x => x.BabyId,
                        principalSchema: "public",
                        principalTable: "Babies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Babies_NannyId",
                schema: "public",
                table: "Babies",
                column: "NannyId");

            migrationBuilder.CreateIndex(
                name: "IX_BabyParent_BabyId_ParentId",
                schema: "public",
                table: "BabyParents",
                columns: new[] { "BabyId", "ParentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BabyParents_ParentId",
                schema: "public",
                table: "BabyParents",
                column: "ParentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BabyParents",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Babies",
                schema: "public");
        }
    }
}
