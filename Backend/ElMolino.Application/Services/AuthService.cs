using ElMolino.Application.DTOs;
using ElMolino.Application.Interfaces;
using ElMolino.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
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
