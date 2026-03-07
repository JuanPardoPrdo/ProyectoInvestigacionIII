using ElMolino.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Inyección de servicios
builder.Services.AddScoped<ElMolino.Application.Interfaces.IAuthService, ElMolino.Application.Services.AuthService>();
builder.Services.AddScoped<ElMolino.Application.Interfaces.IReservaService, ElMolino.Application.Services.ReservaService>();
builder.Services.AddScoped<ElMolino.Application.Interfaces.IRecursoService, ElMolino.Application.Services.RecursoService>();
builder.Services.AddScoped<ElMolino.Application.Interfaces.IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

// CORS for Next.js
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJS",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// Configuración de la DB
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=../ElMolino.db";
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(connectionString));

// Seguridad con JWT
var jwtSecret = builder.Configuration["JwtSettings:Secret"] ?? "MOLINO_SUPER_SECRET_KEY_FOR_JWT_TOKEN_12345!";
var key = Encoding.ASCII.GetBytes(jwtSecret);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

var app = builder.Build();

// Me aseguro de que la base de datos esté lista al arrancar
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        context.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Mala mía, no se pudo inicializar la DB.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowNextJS");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
