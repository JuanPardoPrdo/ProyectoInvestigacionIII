using ElMolino.Application.DTOs;
using ElMolino.Application.Interfaces;
using ElMolino.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ElMolino.Application.Services
{
    public class MultaService : IMultaService
    {
        private readonly IApplicationDbContext _context;

        public MultaService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<MultaDto>> ObtenerMultasAsync()
        {
            var incidentes = await _context.Incidentes
                .Include(i => i.Reserva)
                    .ThenInclude(r => r.Persona)
                .Include(i => i.Reserva)
                    .ThenInclude(r => r.Recurso)
                .OrderByDescending(i => i.FechaReporte)
                .ToListAsync();

            var result = new List<MultaDto>();

            foreach (var inc in incidentes)
            {
                EstadoCuenta? movimiento = null;
                if (inc.IdMovimiento.HasValue)
                {
                    movimiento = await _context.EstadosCuenta
                        .FirstOrDefaultAsync(ec => ec.IdMovimiento == inc.IdMovimiento.Value);
                }

                result.Add(new MultaDto
                {
                    IdIncidente = inc.IdIncidente,
                    IdReserva = inc.IdReserva,
                    IdPersona = inc.Reserva.IdPersona,
                    NombreResidente = inc.Reserva.Persona.NombreCompleto,
                    DocumentoResidente = inc.Reserva.Persona.Documento,
                    NombreRecurso = inc.Reserva.Recurso.Nombre,
                    DescripcionDano = inc.DescripcionDano,
                    MontoMulta = inc.CostoReparacion,
                    FechaReporte = inc.FechaReporte,
                    Pagado = movimiento?.Pagado ?? false,
                    FechaPago = movimiento?.FechaPago,
                    IdMovimiento = inc.IdMovimiento
                });
            }

            return result;
        }

        public async Task<MultaDto> CrearMultaAsync(CrearMultaRequestDto request)
        {
            var reserva = await _context.Reservas
                .Include(r => r.Persona)
                .Include(r => r.Recurso)
                .FirstOrDefaultAsync(r => r.IdReserva == request.IdReserva);

            if (reserva == null)
                throw new InvalidOperationException("La reserva especificada no existe.");

            if (request.MontoMulta <= 0)
                throw new InvalidOperationException("El monto de la multa debe ser mayor a cero.");

            // Crear el movimiento de EstadoCuenta
            var movimiento = new EstadoCuenta
            {
                IdPersona = reserva.IdPersona,
                Concepto = $"Multa por uso indebido - {reserva.Recurso.Nombre}",
                Monto = request.MontoMulta,
                FechaGeneracion = DateTime.UtcNow,
                Pagado = false
            };

            _context.EstadosCuenta.Add(movimiento);
            await _context.SaveChangesAsync();

            // Crear el incidente vinculado al movimiento
            var incidente = new Incidente
            {
                IdReserva = request.IdReserva,
                DescripcionDano = request.DescripcionDano,
                CostoReparacion = request.MontoMulta,
                FechaReporte = DateTime.UtcNow,
                IdMovimiento = movimiento.IdMovimiento
            };

            _context.Incidentes.Add(incidente);
            await _context.SaveChangesAsync();

            return new MultaDto
            {
                IdIncidente = incidente.IdIncidente,
                IdReserva = incidente.IdReserva,
                IdPersona = reserva.IdPersona,
                NombreResidente = reserva.Persona.NombreCompleto,
                DocumentoResidente = reserva.Persona.Documento,
                NombreRecurso = reserva.Recurso.Nombre,
                DescripcionDano = incidente.DescripcionDano,
                MontoMulta = incidente.CostoReparacion,
                FechaReporte = incidente.FechaReporte,
                Pagado = false,
                FechaPago = null,
                IdMovimiento = incidente.IdMovimiento
            };
        }

        public async Task<MultaDto> EditarMultaAsync(int idIncidente, EditarMultaRequestDto request)
        {
            var incidente = await _context.Incidentes
                .Include(i => i.Reserva)
                    .ThenInclude(r => r.Persona)
                .Include(i => i.Reserva)
                    .ThenInclude(r => r.Recurso)
                .FirstOrDefaultAsync(i => i.IdIncidente == idIncidente);

            if (incidente == null)
                throw new InvalidOperationException("La multa especificada no existe.");

            if (request.MontoMulta <= 0)
                throw new InvalidOperationException("El monto de la multa debe ser mayor a cero.");

            if (string.IsNullOrWhiteSpace(request.DescripcionDano))
                throw new InvalidOperationException("La descripción del daño es requerida.");

            EstadoCuenta? movimiento = null;
            if (incidente.IdMovimiento.HasValue)
            {
                movimiento = await _context.EstadosCuenta
                    .FirstOrDefaultAsync(ec => ec.IdMovimiento == incidente.IdMovimiento.Value);

                if (movimiento != null && movimiento.Pagado)
                    throw new InvalidOperationException("No se puede editar una multa que ya ha sido marcada como pagada.");
            }

            var reserva = incidente.Reserva;
            if (incidente.IdReserva != request.IdReserva)
            {
                var nuevaReserva = await _context.Reservas
                    .Include(r => r.Persona)
                    .Include(r => r.Recurso)
                    .FirstOrDefaultAsync(r => r.IdReserva == request.IdReserva);

                if (nuevaReserva == null)
                    throw new InvalidOperationException("La reserva especificada no existe.");

                reserva = nuevaReserva;
                incidente.IdReserva = nuevaReserva.IdReserva;

                if (movimiento != null)
                {
                    movimiento.IdPersona = nuevaReserva.IdPersona;
                    movimiento.Concepto = $"Multa por uso indebido - {nuevaReserva.Recurso.Nombre}";
                }
            }

            incidente.DescripcionDano = request.DescripcionDano.Trim();
            incidente.CostoReparacion = request.MontoMulta;

            if (movimiento != null)
            {
                movimiento.Monto = request.MontoMulta;
            }

            await _context.SaveChangesAsync();

            return new MultaDto
            {
                IdIncidente = incidente.IdIncidente,
                IdReserva = incidente.IdReserva,
                IdPersona = reserva.IdPersona,
                NombreResidente = reserva.Persona.NombreCompleto,
                DocumentoResidente = reserva.Persona.Documento,
                NombreRecurso = reserva.Recurso.Nombre,
                DescripcionDano = incidente.DescripcionDano,
                MontoMulta = incidente.CostoReparacion,
                FechaReporte = incidente.FechaReporte,
                Pagado = movimiento?.Pagado ?? false,
                FechaPago = movimiento?.FechaPago,
                IdMovimiento = incidente.IdMovimiento
            };
        }

        public async Task MarcarPagadaAsync(int idIncidente)
        {
            var incidente = await _context.Incidentes
                .FirstOrDefaultAsync(i => i.IdIncidente == idIncidente);

            if (incidente == null)
                throw new InvalidOperationException("La multa especificada no existe.");

            if (!incidente.IdMovimiento.HasValue)
                throw new InvalidOperationException("Esta multa no tiene un movimiento de cuenta asociado.");

            var movimiento = await _context.EstadosCuenta
                .FirstOrDefaultAsync(ec => ec.IdMovimiento == incidente.IdMovimiento.Value);

            if (movimiento == null)
                throw new InvalidOperationException("No se encontró el movimiento de cuenta asociado a esta multa.");

            if (movimiento.Pagado)
                throw new InvalidOperationException("Esta multa ya fue marcada como pagada.");

            movimiento.Pagado = true;
            movimiento.FechaPago = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task EliminarMultaAsync(int idIncidente)
        {
            var incidente = await _context.Incidentes
                .FirstOrDefaultAsync(i => i.IdIncidente == idIncidente);

            if (incidente == null)
                throw new InvalidOperationException("La multa especificada no existe.");

            // Eliminar el movimiento de EstadoCuenta vinculado si existe
            if (incidente.IdMovimiento.HasValue)
            {
                var movimiento = await _context.EstadosCuenta
                    .FirstOrDefaultAsync(ec => ec.IdMovimiento == incidente.IdMovimiento.Value);

                if (movimiento != null)
                {
                    if (movimiento.Pagado)
                        throw new InvalidOperationException("No se puede eliminar una multa que ya ha sido pagada.");

                    _context.EstadosCuenta.Remove(movimiento);
                }
            }

            _context.Incidentes.Remove(incidente);
            await _context.SaveChangesAsync();
        }
    }
}
