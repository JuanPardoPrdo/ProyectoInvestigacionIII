namespace ElMolino.Application.DTOs
{
    public class MultaDto
    {
        public int IdIncidente { get; set; }
        public int IdReserva { get; set; }
        public int IdPersona { get; set; }
        public required string NombreResidente { get; set; }
        public required string DocumentoResidente { get; set; }
        public required string NombreRecurso { get; set; }
        public required string DescripcionDano { get; set; }
        public decimal MontoMulta { get; set; }
        public DateTime FechaReporte { get; set; }
        public bool Pagado { get; set; }
        public DateTime? FechaPago { get; set; }
        public int? IdMovimiento { get; set; }
    }

    public class CrearMultaRequestDto
    {
        public int IdReserva { get; set; }
        public required string DescripcionDano { get; set; }
        public decimal MontoMulta { get; set; }
    }
}
