using ElMolino.Application.DTOs;

namespace ElMolino.Application.Interfaces
{
    public interface IMultaService
    {
        Task<List<MultaDto>> ObtenerMultasAsync();
        Task<MultaDto> CrearMultaAsync(CrearMultaRequestDto request);
        Task MarcarPagadaAsync(int idIncidente);
        Task EliminarMultaAsync(int idIncidente);
    }
}
