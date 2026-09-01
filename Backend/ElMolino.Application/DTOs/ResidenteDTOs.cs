namespace ElMolino.Application.DTOs
{
    public class UnidadDto
    {
        public int IdUnidad { get; set; }
        public required string NumeroUnidad { get; set; }
        public string? BloqueTorre { get; set; }
    }

    public class CrearUnidadRequestDto
    {
        public required string NumeroUnidad { get; set; }
        public string? BloqueTorre { get; set; }
    }

    public class ActualizarUnidadRequestDto
    {
        public required string NumeroUnidad { get; set; }
        public string? BloqueTorre { get; set; }
    }

    public class ResidenteDto
    {
        public int IdPersona { get; set; }
        public int IdUnidad { get; set; }
        public required string NumeroUnidad { get; set; }
        public string? BloqueTorre { get; set; }
        public required string NombreCompleto { get; set; }
        public required string Documento { get; set; }
        public required string Rol { get; set; }
        public string? Email { get; set; }
        public int Estado { get; set; }
    }

    public class CrearResidenteRequestDto
    {
        public int IdUnidad { get; set; }
        public required string NombreCompleto { get; set; }
        public required string Documento { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public string Rol { get; set; } = "Residente";
        public int Estado { get; set; } = 1;
    }

    public class ActualizarResidenteRequestDto
    {
        public int IdUnidad { get; set; }
        public required string NombreCompleto { get; set; }
        public required string Documento { get; set; }
        public required string Email { get; set; }
        public string? Password { get; set; }
        public string Rol { get; set; } = "Residente";
        public int Estado { get; set; } = 1;
    }
}
