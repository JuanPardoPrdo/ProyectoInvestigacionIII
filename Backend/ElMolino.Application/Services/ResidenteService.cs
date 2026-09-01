using ElMolino.Application.DTOs;
using ElMolino.Application.Interfaces;
using ElMolino.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ElMolino.Application.Services
{
    public class ResidenteService : IResidenteService
    {
        private readonly IApplicationDbContext _context;

        public ResidenteService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ResidenteDto>> ObtenerTodosAsync()
        {
            return await _context.Personas
                .Include(p => p.Unidad)
                .Where(p => p.Rol != "Administrador")
                .Select(p => new ResidenteDto
                {
                    IdPersona = p.IdPersona,
                    IdUnidad = p.IdUnidad,
                    NumeroUnidad = p.Unidad != null ? p.Unidad.NumeroUnidad : "",
                    BloqueTorre = p.Unidad != null ? p.Unidad.BloqueTorre : "",
                    NombreCompleto = p.NombreCompleto,
                    Documento = p.Documento,
                    Rol = p.Rol,
                    Email = p.Email,
                    Estado = p.Estado
                })
                .ToListAsync();
        }

        public async Task<ResidenteDto?> ObtenerPorIdAsync(int id)
        {
            var p = await _context.Personas
                .Include(p => p.Unidad)
                .FirstOrDefaultAsync(p => p.IdPersona == id);

            if (p == null) return null;

            return new ResidenteDto
            {
                IdPersona = p.IdPersona,
                IdUnidad = p.IdUnidad,
                NumeroUnidad = p.Unidad != null ? p.Unidad.NumeroUnidad : "",
                BloqueTorre = p.Unidad != null ? p.Unidad.BloqueTorre : "",
                NombreCompleto = p.NombreCompleto,
                Documento = p.Documento,
                Rol = p.Rol,
                Email = p.Email,
                Estado = p.Estado
            };
        }

        public async Task<ResidenteDto> CrearResidenteAsync(CrearResidenteRequestDto request)
        {
            var unidad = await _context.Unidades.FindAsync(request.IdUnidad);
            if (unidad == null)
            {
                throw new Exception("La unidad residencial especificada no existe.");
            }

            var existeDocumento = await _context.Personas.AnyAsync(p => p.Documento == request.Documento);
            if (existeDocumento)
            {
                throw new Exception("Ya existe un residente registrado con este número de documento.");
            }

            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                var existeEmail = await _context.Personas.AnyAsync(p => p.Email == request.Email);
                if (existeEmail)
                {
                    throw new Exception("Ya existe un usuario registrado con este correo electrónico.");
                }
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var nuevoResidente = new Persona
            {
                IdUnidad = request.IdUnidad,
                NombreCompleto = request.NombreCompleto,
                Documento = request.Documento,
                Rol = string.IsNullOrWhiteSpace(request.Rol) ? "Residente" : request.Rol,
                Email = request.Email,
                PasswordHash = passwordHash,
                Estado = request.Estado
            };

            _context.Personas.Add(nuevoResidente);
            await _context.SaveChangesAsync();

            return new ResidenteDto
            {
                IdPersona = nuevoResidente.IdPersona,
                IdUnidad = nuevoResidente.IdUnidad,
                NumeroUnidad = unidad.NumeroUnidad,
                BloqueTorre = unidad.BloqueTorre,
                NombreCompleto = nuevoResidente.NombreCompleto,
                Documento = nuevoResidente.Documento,
                Rol = nuevoResidente.Rol,
                Email = nuevoResidente.Email,
                Estado = nuevoResidente.Estado
            };
        }

        public async Task ActualizarResidenteAsync(int id, ActualizarResidenteRequestDto request)
        {
            var residente = await _context.Personas.FindAsync(id);
            if (residente == null)
            {
                throw new Exception("Residente no encontrado.");
            }

            var unidadExiste = await _context.Unidades.AnyAsync(u => u.IdUnidad == request.IdUnidad);
            if (!unidadExiste)
            {
                throw new Exception("La unidad residencial especificada no existe.");
            }

            var existeDocumento = await _context.Personas.AnyAsync(p => p.IdPersona != id && p.Documento == request.Documento);
            if (existeDocumento)
            {
                throw new Exception("Ya existe otro residente con este número de documento.");
            }

            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                var existeEmail = await _context.Personas.AnyAsync(p => p.IdPersona != id && p.Email == request.Email);
                if (existeEmail)
                {
                    throw new Exception("Ya existe otro usuario con este correo electrónico.");
                }
            }

            residente.IdUnidad = request.IdUnidad;
            residente.NombreCompleto = request.NombreCompleto;
            residente.Documento = request.Documento;
            residente.Email = request.Email;
            residente.Estado = request.Estado;

            if (!string.IsNullOrWhiteSpace(request.Rol))
            {
                residente.Rol = request.Rol;
            }

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                residente.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            }

            await _context.SaveChangesAsync();
        }

        public async Task EliminarResidenteAsync(int id)
        {
            var residente = await _context.Personas.FindAsync(id);
            if (residente == null)
            {
                throw new Exception("Residente no encontrado.");
            }

            var tieneReservas = await _context.Reservas.AnyAsync(r => r.IdPersona == id);
            if (tieneReservas)
            {
                throw new Exception("No se puede eliminar el residente porque tiene reservas registradas en el sistema.");
            }

            var tieneCuentas = await _context.EstadosCuenta.AnyAsync(ec => ec.IdPersona == id);
            if (tieneCuentas)
            {
                throw new Exception("No se puede eliminar el residente porque tiene movimientos en su estado de cuenta.");
            }

            _context.Personas.Remove(residente);
            await _context.SaveChangesAsync();
        }

        public async Task<List<UnidadDto>> ObtenerUnidadesAsync()
        {
            return await _context.Unidades
                .Select(u => new UnidadDto
                {
                    IdUnidad = u.IdUnidad,
                    NumeroUnidad = u.NumeroUnidad,
                    BloqueTorre = u.BloqueTorre
                })
                .ToListAsync();
        }
    }
}
