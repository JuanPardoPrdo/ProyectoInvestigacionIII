using ElMolino.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ElMolino.Application.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<Unidad> Unidades { get; set; }
        DbSet<Persona> Personas { get; set; }
        DbSet<EstadoCuenta> EstadosCuenta { get; set; }
        DbSet<Recurso> Recursos { get; set; }
        DbSet<Reserva> Reservas { get; set; }
        DbSet<Incidente> Incidentes { get; set; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
