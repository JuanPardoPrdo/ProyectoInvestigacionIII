namespace ElMolino.Application.DTOs
{
    public class RecursoDto
    {
        public int IdRecurso { get; set; }
        public required string Nombre { get; set; }
        public required string Tipo { get; set; }
        public decimal CostoPorReserva { get; set; }
        public required string EstadoFisico { get; set; }
    }

    public class ReservaDto
    {
        public int IdReserva { get; set; }
        public int IdPersona { get; set; }
        public RecursoDto? Recurso { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public decimal CostoTotal { get; set; }
        public required string EstadoReserva { get; set; }
    }

    public class CrearReservaRequestDto
    {
        public int IdRecurso { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
    }

    public class ActualizarReservaRequestDto
    {
        public int IdRecurso { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
    }
}
