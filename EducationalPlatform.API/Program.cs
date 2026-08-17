using EducationalPlatform.Application.DTOs.Courses;
using EducationalPlatform.Application.Interfaces;
using EducationalPlatform.Application.Interfaces.External_services;
using EducationalPlatform.Application.Interfaces.Security;
using EducationalPlatform.Domain.Entities;
using EducationalPlatform.Infrastructure;
using EducationalPlatform.Infrastructure.Data;
using EducationalPlatform.Infrastructure.Security;
using EducationalPlatform.Infrastructure.Services;
using EducationalPlatform.Infrastructure.Services.External_services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// -------------------- CORS --------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:4200",
            "http://127.0.0.1:4200",
            "https://localhost:4200",
            "https://matterhubfrontend.runasp.net",
            "https://matterhub-nine.vercel.app"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

// -------------------- Controllers & Cache --------------------
builder.Services.AddControllers();
builder.Services.AddMemoryCache();
builder.Services.AddHttpContextAccessor();

// -------------------- Swagger --------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Educational Platform API", Version = "v1" });
});

// -------------------- Dependency Injection --------------------
builder.Services.AddScoped<IUserSessionManager, UserSessionManager>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher>();
builder.Services.AddScoped<IFileStorageService, FileStorageService>();

builder.Services.AddIdentityCore<EducationalPlatform.Domain.Entities.User>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 1;
    options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+ ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىي";
})
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager<SignInManager<EducationalPlatform.Domain.Entities.User>>();

// -------------------- Database --------------------
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null
        )
    ));

// -------------------- Infrastructure --------------------
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHostedService<WeeklyDigestService>();

// -------------------- Session Authentication --------------------
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = SessionAuthenticationHandler.SchemeName;
    options.DefaultChallengeScheme = SessionAuthenticationHandler.SchemeName;
    options.DefaultScheme = SessionAuthenticationHandler.SchemeName;
})
.AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, SessionAuthenticationHandler>(
    SessionAuthenticationHandler.SchemeName,
    _ => { }
);

// -------------------- Build App --------------------
var app = builder.Build();

app.UseMiddleware<EducationalPlatform.API.Middleware.ExceptionLoggingMiddleware>();

// -------------------- Middleware Pipeline --------------------
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Educational Platform API v1");
    c.RoutePrefix = string.Empty; // Set Swagger as the home page
});

app.UseCors("AllowFrontend");
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        // Cache images and static files for 30 days in client browser and CDN
        ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=2592000,immutable");
    }
});

// app.UseHttpsRedirection();

app.UseAuthentication(); // Important: must be before Authorization
app.UseAuthorization();

app.MapControllers();

// -------------------- Seed Database --------------------
await EducationalPlatform.Infrastructure.Data.DatabaseSeeder.SeedAsync(app.Services);

try
{
    app.Run();
}
catch (Exception ex)
{
    app.Logger.LogCritical(ex, "Application terminated unexpectedly");
}

