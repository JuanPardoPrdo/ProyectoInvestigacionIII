using ElMolino.Application.DTOs;
using ElMolino.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ElMolino.API.Controllers
{
    [ApiController]
    [Route("api/multas")]
    [Authorize(Roles = "Administrador")]
    public class MultasController : ControllerBase
    {
        private readonly IMultaService _multaService;

        public MultasController(IMultaService multaService)
        {
            _multaService = multaService;
        }

        // GET /api/multas
        [HttpGet]
        public async Task<IActionResult> ObtenerMultas()
        {
            var multas = await _multaService.ObtenerMultasAsync();
            return Ok(new { multas });
        }

        // POST /api/multas
        [HttpPost]
        public async Task<IActionResult> CrearMulta([FromBody] CrearMultaRequestDto request)
        {
            try
            {
                var multa = await _multaService.CrearMultaAsync(request);
                return CreatedAtAction(nameof(ObtenerMultas), new { }, new { message = "Multa registrada exitosamente.", multa });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/multas/{id}/pagar
        [HttpPut("{id}/pagar")]
        public async Task<IActionResult> MarcarPagada(int id)
        {
            try
            {
                await _multaService.MarcarPagadaAsync(id);
                return Ok(new { message = "Multa marcada como pagada exitosamente." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE /api/multas/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarMulta(int id)
        {
            try
            {
                await _multaService.EliminarMultaAsync(id);
                return Ok(new { message = "Multa eliminada exitosamente." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
