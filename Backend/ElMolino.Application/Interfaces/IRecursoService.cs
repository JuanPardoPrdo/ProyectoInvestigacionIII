using ElMolino.Application.DTOs;

namespace ElMolino.Application.Interfaces
{
    public interface IRecursoService
    {
        Task<List<RecursoDto>> ObtenerTodosAsync();
        Task<RecursoDto> CrearRecursoAsync(CrearRecursoRequestDto request);
        Task ActualizarRecursoAsync(int id, ActualizarRecursoRequestDto request);
        Task EliminarRecursoAsync(int id);
    }
}
