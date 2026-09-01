using ElMolino.Application.DTOs;

namespace ElMolino.Application.Interfaces
{
    public interface IResidenteService
    {
        Task<List<ResidenteDto>> ObtenerTodosAsync();
        Task<ResidenteDto?> ObtenerPorIdAsync(int id);
        Task<ResidenteDto> CrearResidenteAsync(CrearResidenteRequestDto request);
        Task ActualizarResidenteAsync(int id, ActualizarResidenteRequestDto request);
        Task EliminarResidenteAsync(int id);
        Task<List<UnidadDto>> ObtenerUnidadesAsync();
        Task<UnidadDto> CrearUnidadAsync(CrearUnidadRequestDto request);
        Task ActualizarUnidadAsync(int id, ActualizarUnidadRequestDto request);
        Task EliminarUnidadAsync(int id);
    }
}
