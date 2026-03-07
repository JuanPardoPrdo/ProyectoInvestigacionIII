using ElMolino.Application.DTOs;

namespace ElMolino.Application.Interfaces
{
    public interface IReservaService
    {
        Task<List<RecursoDto>> ObtenerRecursosDisponiblesAsync();
        Task<List<ReservaDto>> ObtenerReservasAsync(int? idPersonaContexto = null);
        Task<ReservaDto> CrearReservaAsync(CrearReservaRequestDto request, int idPersona);
        Task ActualizarReservaAsync(int idReserva, ActualizarReservaRequestDto request, int idPersona, string rol);
        Task CancelarReservaAsync(int idReserva, int idPersona);
    }
}
