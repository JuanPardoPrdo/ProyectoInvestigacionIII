using ElMolino.Application.DTOs;
using ElMolino.Application.Interfaces;
using ElMolino.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;

namespace ElMolino.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IApplicationDbContext _context;
        private readonly IConfiguration _config;

        public AuthService(IApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task<LoginResponseDto> AuthenticateAsync(LoginRequestDto request)
        {
            var user = await _context.Personas
                .FirstOrDefaultAsync(p => p.Email == request.Email);

            if (user == null)
            {
                throw new Exception("Credenciales incorrectas"); // RNF-03
            }

            if (user.Estado == 0)
            {
                throw new Exception("Usuario inactivo. Por favor, comuníquese con la administración."); // RF-03
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

            if (!isPasswordValid)
            {
                throw new Exception("Credenciales incorrectas"); // RNF-03
            }

            var token = GenerateJwtToken(user);

            return new LoginResponseDto
            {
                IdPersona = user.IdPersona,
                NombreCompleto = user.NombreCompleto,
                Rol = user.Rol,
                Token = token
            };
        }

        public async Task SolicitarResetPasswordAsync(SolicitarResetDto request)
        {
            // Buscamos el usuario — siempre respondemos OK para no revelar si el email existe (seguridad)
            var user = await _context.Personas
                .FirstOrDefaultAsync(p => p.Email == request.Email);

            if (user == null) return;

            // Generamos token único de 32 chars
            var token = Guid.NewGuid().ToString("N");
            user.ResetToken = token;
            user.ResetTokenExpiry = DateTime.UtcNow.AddMinutes(15);
            await _context.SaveChangesAsync();

            // Construimos el link de reset
            var frontendUrl = _config["AppSettings:FrontendUrl"] ?? "http://localhost:3000";
            var resetLink = $"{frontendUrl}/reset-password?token={token}";

            await EnviarCorreoResetAsync(user.Email!, user.NombreCompleto, resetLink);
        }

        public async Task ConfirmarResetPasswordAsync(ConfirmarResetDto request)
        {
            var user = await _context.Personas
                .FirstOrDefaultAsync(p => p.ResetToken == request.Token);

            if (user == null)
                throw new Exception("El token de restablecimiento no es válido.");

            if (user.ResetTokenExpiry == null || user.ResetTokenExpiry < DateTime.UtcNow)
                throw new Exception("El token ha expirado. Solicita un nuevo restablecimiento.");

            if (string.IsNullOrWhiteSpace(request.NuevaPassword) || request.NuevaPassword.Length < 6)
                throw new Exception("La nueva contraseña debe tener al menos 6 caracteres.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NuevaPassword);
            user.ResetToken = null;
            user.ResetTokenExpiry = null;
            await _context.SaveChangesAsync();
        }

        // ─── Envío de correo ──────────────────────────────────────────────────────
        private async Task EnviarCorreoResetAsync(string destinatario, string nombre, string resetLink)
        {
            var smtpHost = _config["SmtpSettings:Host"];
            var smtpPort = int.TryParse(_config["SmtpSettings:Port"], out var p) ? p : 587;
            var smtpUser = _config["SmtpSettings:User"];
            var smtpPass = _config["SmtpSettings:Password"];
            var smtpFrom = _config["SmtpSettings:From"] ?? smtpUser;
            var modoConsola = _config["SmtpSettings:ModoConsola"];

            var cuerpo = $@"
Hola {nombre},

Recibimos una solicitud para restablecer la contraseña de tu cuenta en El Molino.

Haz clic en el siguiente enlace para crear una nueva contraseña (válido por 15 minutos):

{resetLink}

Si no solicitaste este cambio, ignora este correo. Tu contraseña actual seguirá siendo la misma.

—El Molino, Portal de Reservas Residencial
";

            // MODO CONSOLA: imprime en la terminal del backend en lugar de enviar correo real
            if (string.IsNullOrWhiteSpace(smtpHost) || modoConsola?.ToLower() == "true")
            {
                Console.ForegroundColor = ConsoleColor.Cyan;
                Console.WriteLine("╔══════════════════════════════════════════════════════╗");
                Console.WriteLine("║          CORREO DE RESTABLECIMIENTO (TEST)           ║");
                Console.WriteLine("╠══════════════════════════════════════════════════════╣");
                Console.WriteLine($"║ Para:    {destinatario}");
                Console.WriteLine($"║ Nombre:  {nombre}");
                Console.WriteLine($"║ Link:    {resetLink}");
                Console.WriteLine("╚══════════════════════════════════════════════════════╝");
                Console.ResetColor();
                return;
            }

            // MODO SMTP REAL
            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(smtpUser, smtpPass)
            };

            var mail = new MailMessage
            {
                From = new MailAddress(smtpFrom!, "El Molino - Portal Residencial"),
                Subject = "Restablecimiento de contraseña - El Molino",
                Body = cuerpo,
                IsBodyHtml = false
            };
            mail.To.Add(destinatario);

            await client.SendMailAsync(mail);
        }

        private string GenerateJwtToken(Persona user)
        {
            var jwtSecret = _config["JwtSettings:Secret"] ?? "MOLINO_SUPER_SECRET_KEY_FOR_JWT_TOKEN_12345!";
            var securityKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSecret));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.IdPersona.ToString()),
                new Claim(ClaimTypes.Name, user.NombreCompleto),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
                new Claim(ClaimTypes.Role, user.Rol)
            };

            var token = new JwtSecurityToken(
                issuer: "ElMolino",
                audience: "ElMolinoUsers",
                claims: claims,
                expires: DateTime.Now.AddHours(4),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
