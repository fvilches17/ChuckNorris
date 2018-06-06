using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace ChuckNorris.Api.Migrations
{
    public partial class AddedSubscriptions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Subscriptions",
                columns: table => new
                {
                    UserName = table.Column<string>(nullable: false),
                    Endpoint = table.Column<string>(nullable: true),
                    ExpirationTime = table.Column<DateTime>(nullable: true),
                    p256dh = table.Column<string>(nullable: true),
                    auth = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subscriptions", x => x.UserName);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Subscriptions");
        }
    }
}
