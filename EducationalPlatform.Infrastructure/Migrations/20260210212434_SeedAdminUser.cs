using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EducationalPlatform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedAdminUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var adminRoleId = Guid.NewGuid().ToString();
            var adminUserId = Guid.NewGuid().ToString();
            var concurrencyStampRole = Guid.NewGuid().ToString();
            var concurrencyStampUser = Guid.NewGuid().ToString();
            var securityStampUser = Guid.NewGuid().ToString();

            // Seed Admin Role using SQL to check for existence
            migrationBuilder.Sql($@"
                IF NOT EXISTS (SELECT 1 FROM AspNetRoles WHERE NormalizedName = 'ADMIN')
                BEGIN
                    INSERT INTO AspNetRoles (Id, Name, NormalizedName, ConcurrencyStamp)
                    VALUES ('{adminRoleId}', 'Admin', 'ADMIN', '{concurrencyStampRole}');
                END
            ");

            // Seed Admin User using SQL to check for existence
            var passwordHash = "AQAAAAIAAYagAAAAEPKx2m8q6X8v9R1+QyHjY9zU5K6X8v9R1+QyHjY9zU5K6X8v9R1+QyHjY9zU5K6X8v9R1+Q==";

            migrationBuilder.Sql($@"
                IF NOT EXISTS (SELECT 1 FROM AspNetUsers WHERE NormalizedEmail = 'OSAMAMATTER390@GMAIL.COM')
                BEGIN
                    INSERT INTO AspNetUsers (Id, UserName, NormalizedUserName, Email, NormalizedEmail, EmailConfirmed, PasswordHash, SecurityStamp, ConcurrencyStamp, PhoneNumberConfirmed, TwoFactorEnabled, LockoutEnabled, AccessFailedCount, FirstName, LastName, Role, CreatedAt)
                    VALUES ('{adminUserId}', 'Osama Matter', 'OSAMA MATTER', 'osamamatter390@gmail.com', 'OSAMAMATTER390@GMAIL.COM', 1, '{passwordHash}', '{securityStampUser}', '{concurrencyStampUser}', 0, 0, 1, 0, 'Osama', 'Matter', 0, GETUTCDATE());

                    -- Assign User to Role only if user was just created
                    DECLARE @RoleId nvarchar(450);
                    SELECT @RoleId = Id FROM AspNetRoles WHERE NormalizedName = 'ADMIN';
                    
                    IF @RoleId IS NOT NULL
                    BEGIN
                        INSERT INTO AspNetUserRoles (UserId, RoleId)
                        VALUES ('{adminUserId}', @RoleId);
                    END
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM AspNetUserRoles");
            migrationBuilder.Sql("DELETE FROM AspNetUsers");
            migrationBuilder.Sql("DELETE FROM AspNetRoles");
        }
    }
}
