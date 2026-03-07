namespace ElMolino.Application.DTOs
{
    public class CrearRecursoRequestDto
    {
        public required string Nombre { get; set; }
        public required string Tipo { get; set; }
        public decimal CostoPorReserva { get; set; }
        public string EstadoFisico { get; set; } = "Disponible";
    }

    public class ActualizarRecursoRequestDto
    {
        public required string Nombre { get; set; }
        public required string Tipo { get; set; }
        public decimal CostoPorReserva { get; set; }
        public required string EstadoFisico { get; set; }
    }
}
