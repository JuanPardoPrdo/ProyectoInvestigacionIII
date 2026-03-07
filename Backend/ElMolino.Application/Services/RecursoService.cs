using ElMolino.Application.DTOs;
using ElMolino.Application.Interfaces;
using ElMolino.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ElMolino.Application.Services
{
    public class RecursoService : IRecursoService
    {
        private readonly IApplicationDbContext _context;

        public RecursoService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<RecursoDto>> ObtenerTodosAsync()
        {
            return await _context.Recursos
                .Select(r => new RecursoDto
                {
                    IdRecurso = r.IdRecurso,
                    Nombre = r.Nombre,
                    Tipo = r.Tipo,
                    CostoPorReserva = r.CostoPorReserva,
                    EstadoFisico = r.EstadoFisico
                })
                .ToListAsync();
        }

        public async Task<RecursoDto> CrearRecursoAsync(CrearRecursoRequestDto request)
        {
            var r = new Recurso
            {
                Nombre = request.Nombre,
                Tipo = request.Tipo,
                CostoPorReserva = request.CostoPorReserva,
                EstadoFisico = request.EstadoFisico
            };

            _context.Recursos.Add(r);
            await _context.SaveChangesAsync();

            return new RecursoDto
            {
                IdRecurso = r.IdRecurso,
                Nombre = r.Nombre,
                Tipo = r.Tipo,
                CostoPorReserva = r.CostoPorReserva,
                EstadoFisico = r.EstadoFisico
            };
        }

        public async Task ActualizarRecursoAsync(int id, ActualizarRecursoRequestDto request)
        {
            var r = await _context.Recursos.FindAsync(id);
            if (r == null) throw new Exception("Espacio no encontrado.");

            r.Nombre = request.Nombre;
            r.Tipo = request.Tipo;
            r.CostoPorReserva = request.CostoPorReserva;
            r.EstadoFisico = request.EstadoFisico;

            await _context.SaveChangesAsync();
        }

        public async Task EliminarRecursoAsync(int id)
        {
            var r = await _context.Recursos.FindAsync(id);
            if (r == null) throw new Exception("Espacio no encontrado.");

            // Validar si tiene reservas antes de eliminar (opcional, pero recomendado)
            var tieneReservas = await _context.Reservas.AnyAsync(res => res.IdRecurso == id);
            if (tieneReservas) throw new Exception("No se puede eliminar el espacio porque tiene reservas asociadas.");

            _context.Recursos.Remove(r);
            await _context.SaveChangesAsync();
        }
    }
}
