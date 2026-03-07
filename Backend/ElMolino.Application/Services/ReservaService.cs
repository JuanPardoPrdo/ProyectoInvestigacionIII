using ElMolino.Application.DTOs;
using ElMolino.Application.Interfaces;
using ElMolino.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ElMolino.Application.Services
{
    public class ReservaService : IReservaService
    {
        private readonly IApplicationDbContext _context;

        public ReservaService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<RecursoDto>> ObtenerRecursosDisponiblesAsync()
        {
            return await _context.Recursos
                .Select(r => new RecursoDto
                {
                    IdRecurso = r.IdRecurso,
                    Nombre = r.Nombre,
                    Tipo = r.Tipo,
                    CostoPorReserva = r.CostoPorReserva,
                    EstadoFisico = r.EstadoFisico
                }).ToListAsync();
        }

        public async Task<List<ReservaDto>> ObtenerReservasAsync(int? idPersonaContexto = null)
        {
            var query = _context.Reservas
                .Include(r => r.Recurso)
                .AsQueryable();

            if (idPersonaContexto.HasValue)
            {
                query = query.Where(r => r.IdPersona == idPersonaContexto.Value);
            }

            return await query
                .OrderByDescending(r => r.FechaInicio)
                .Select(r => new ReservaDto
                {
                    IdReserva = r.IdReserva,
                    IdPersona = r.IdPersona,
                    FechaInicio = r.FechaInicio,
                    FechaFin = r.FechaFin,
                    CostoTotal = r.CostoTotal,
                    EstadoReserva = r.EstadoReserva,
                    Recurso = new RecursoDto
                    {
                        IdRecurso = r.Recurso.IdRecurso,
                        Nombre = r.Recurso.Nombre,
                        Tipo = r.Recurso.Tipo,
                        CostoPorReserva = r.Recurso.CostoPorReserva,
                        EstadoFisico = r.Recurso.EstadoFisico
                    }
                }).ToListAsync();
        }

        public async Task<ReservaDto> CrearReservaAsync(CrearReservaRequestDto request, int idPersona)
        {
            // 1. Validar Fechas lógicas
            if (request.FechaInicio >= request.FechaFin)
                throw new Exception("La fecha de fin debe ser posterior a la fecha de inicio.");

            if (request.FechaInicio < DateTime.Now)
                throw new Exception("No se pueden hacer reservas en el pasado.");

            var recurso = await _context.Recursos.FindAsync(request.IdRecurso);
            if (recurso == null)
                throw new Exception("El recurso no existe.");

            // 2. Validar Estado Físico
            if (recurso.EstadoFisico != "Disponible")
                throw new Exception("El recurso no se encuentra disponible.");

            // 3. Validar Estado Cuenta (Paz y Salvo)
            var deudas = await _context.EstadosCuenta
                .Where(ec => ec.IdPersona == idPersona && !ec.Pagado)
                .ToListAsync();

            if (deudas.Any())
                throw new Exception("El usuario no se encuentra a paz y salvo.");

            // 4. Validar Conflictos (Overbooking)
            var existeConflicto = await _context.Reservas
                .AnyAsync(r => r.IdRecurso == request.IdRecurso &&
                               r.EstadoReserva == "Confirmada" &&
                               request.FechaInicio < r.FechaFin &&
                               request.FechaFin > r.FechaInicio);

            if (existeConflicto)
                throw new Exception("El recurso ya se encuentra reservado en el horario solicitado.");

            // 5. Crear Reserva
            var nuevaReserva = new Reserva
            {
                IdPersona = idPersona,
                IdRecurso = request.IdRecurso,
                FechaInicio = request.FechaInicio,
                FechaFin = request.FechaFin,
                CostoTotal = recurso.CostoPorReserva,
                EstadoReserva = "Confirmada",
                FechaCreacion = DateTime.Now
            };

            _context.Reservas.Add(nuevaReserva);
            await _context.SaveChangesAsync();

            return new ReservaDto
            {
                IdReserva = nuevaReserva.IdReserva,
                IdPersona = nuevaReserva.IdPersona,
                FechaInicio = nuevaReserva.FechaInicio,
                FechaFin = nuevaReserva.FechaFin,
                CostoTotal = nuevaReserva.CostoTotal,
                EstadoReserva = nuevaReserva.EstadoReserva
            };
        }

        public async Task ActualizarReservaAsync(int idReserva, ActualizarReservaRequestDto request, int idPersona, string rol)
        {
            var reserva = await _context.Reservas
                .Include(r => r.Recurso)
                .FirstOrDefaultAsync(r => r.IdReserva == idReserva);

            if (reserva == null)
                throw new Exception("Reserva no encontrada.");

            // Validar propiedad o rol Admin
            if (rol != "Administrador" && reserva.IdPersona != idPersona)
                throw new UnauthorizedAccessException("No tiene permiso para modificar esta reserva.");

            // Validar fechas
            if (request.FechaInicio >= request.FechaFin)
                throw new Exception("La fecha de fin debe ser posterior a la fecha de inicio.");

            // Usar comparaciones locales para evitar desfase de zona horaria
            if (request.FechaInicio < DateTime.Now && request.FechaInicio != reserva.FechaInicio)
                throw new Exception("No se puede mover una reserva al pasado.");

            // Validar recurso
            var recurso = await _context.Recursos.FindAsync(request.IdRecurso);
            if (recurso == null)
                throw new Exception("El recurso no existe.");

            if (recurso.EstadoFisico != "Disponible")
                throw new Exception("El recurso no se encuentra disponible.");

            // Validar Conflictos (excluyendo la reserva actual)
            var existeConflicto = await _context.Reservas
                .AnyAsync(r => r.IdReserva != idReserva &&
                               r.IdRecurso == request.IdRecurso &&
                               r.EstadoReserva == "Confirmada" &&
                               request.FechaInicio < r.FechaFin &&
                               request.FechaFin > r.FechaInicio);

            if (existeConflicto)
                throw new Exception("El recurso ya se encuentra reservado en el horario solicitado.");

            // Actualizar
            reserva.IdRecurso = request.IdRecurso;
            reserva.FechaInicio = request.FechaInicio;
            reserva.FechaFin = request.FechaFin;
            reserva.CostoTotal = recurso.CostoPorReserva;

            await _context.SaveChangesAsync();
        }

        public async Task CancelarReservaAsync(int idReserva, int idPersona)
        {
            var reserva = await _context.Reservas.FirstOrDefaultAsync(r => r.IdReserva == idReserva);

            if (reserva == null)
                throw new Exception("Reserva no encontrada.");

            if (reserva.IdPersona != idPersona)
                throw new UnauthorizedAccessException("Usted no es el propietario de esta reserva.");

            reserva.EstadoReserva = "Cancelada";
            await _context.SaveChangesAsync();
        }
    }
}
