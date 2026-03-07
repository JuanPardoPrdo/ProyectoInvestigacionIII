namespace ElMolino.Domain.Entities
{
    public class Unidad
    {
        public int IdUnidad { get; set; }
        public required string NumeroUnidad { get; set; }
        public string? BloqueTorre { get; set; }

        public ICollection<Persona> Personas { get; set; } = new List<Persona>();
    }

    public class Persona
    {
        public int IdPersona { get; set; }
        public int IdUnidad { get; set; }
        public required string NombreCompleto { get; set; }
        public required string Documento { get; set; }
        public required string Rol { get; set; } // 'Propietario', 'Residente', 'Administrador'
        public string? Email { get; set; }
        public string? PasswordHash { get; set; }
        public int Estado { get; set; } = 1;

        public Unidad Unidad { get; set; } = null!;
        public ICollection<EstadoCuenta> EstadosCuenta { get; set; } = new List<EstadoCuenta>();
        public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
    }

    public class EstadoCuenta
    {
        public int IdMovimiento { get; set; }
        public int IdPersona { get; set; }
        public required string Concepto { get; set; }
        public decimal Monto { get; set; }
        public DateTime FechaGeneracion { get; set; } = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        public bool Pagado { get; set; } = false;
        public DateTime? FechaPago { get; set; }

        public Persona Persona { get; set; } = null!;
    }

    public class Recurso
    {
        public int IdRecurso { get; set; }
        public required string Nombre { get; set; }
        public required string Tipo { get; set; }
        public decimal CostoPorReserva { get; set; } = 0;
        public string EstadoFisico { get; set; } = "Disponible";

        public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
    }

    public class Reserva
    {
        public int IdReserva { get; set; }
        public int IdPersona { get; set; }
        public int IdRecurso { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public decimal CostoTotal { get; set; } = 0;
        public string EstadoReserva { get; set; } = "Confirmada";
        public DateTime FechaCreacion { get; set; } = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        public Persona Persona { get; set; } = null!;
        public Recurso Recurso { get; set; } = null!;
        public ICollection<Incidente> Incidentes { get; set; } = new List<Incidente>();
    }

    public class Incidente
    {
        public int IdIncidente { get; set; }
        public int IdReserva { get; set; }
        public required string DescripcionDano { get; set; }
        public decimal CostoReparacion { get; set; }
        public DateTime FechaReporte { get; set; } = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        public Reserva Reserva { get; set; } = null!;
    }
}
