namespace ElMolino.Application.DTOs
{
    public class LoginRequestDto
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }

    public class LoginResponseDto
    {
        public int IdPersona { get; set; }
        public required string NombreCompleto { get; set; }
        public required string Rol { get; set; }
        public required string Token { get; set; }
    }
}
