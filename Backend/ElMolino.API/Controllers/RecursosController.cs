using ElMolino.Application.DTOs;
using ElMolino.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ElMolino.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RecursosController : ControllerBase
    {
        private readonly IRecursoService _recursoService;

        public RecursosController(IRecursoService recursoService)
        {
            _recursoService = recursoService;
        }

        [HttpGet]
        public async Task<IActionResult> GetRecursos()
        {
            var recursos = await _recursoService.ObtenerTodosAsync();
            return Ok(new { recursos });
        }

        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> CrearRecurso([FromBody] CrearRecursoRequestDto request)
        {
            try
            {
                var recurso = await _recursoService.CrearRecursoAsync(request);
                return Ok(new { message = "Espacio creado exitosamente", recurso });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> ActualizarRecurso(int id, [FromBody] ActualizarRecursoRequestDto request)
        {
            try
            {
                await _recursoService.ActualizarRecursoAsync(id, request);
                return Ok(new { message = "Espacio actualizado exitosamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> EliminarRecurso(int id)
        {
            try
            {
                await _recursoService.EliminarRecursoAsync(id);
                return Ok(new { message = "Espacio eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
