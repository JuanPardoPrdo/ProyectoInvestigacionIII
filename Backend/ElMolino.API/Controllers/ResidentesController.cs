using ElMolino.Application.DTOs;
using ElMolino.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ElMolino.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Administrador")]
    public class ResidentesController : ControllerBase
    {
        private readonly IResidenteService _residenteService;

        public ResidentesController(IResidenteService residenteService)
        {
            _residenteService = residenteService;
        }

        [HttpGet]
        public async Task<IActionResult> GetResidentes()
        {
            var residentes = await _residenteService.ObtenerTodosAsync();
            return Ok(new { residentes });
        }

        [HttpGet("unidades")]
        public async Task<IActionResult> GetUnidades()
        {
            var unidades = await _residenteService.ObtenerUnidadesAsync();
            return Ok(new { unidades });
        }

        [HttpPost("unidades")]
        public async Task<IActionResult> CrearUnidad([FromBody] CrearUnidadRequestDto request)
        {
            try
            {
                var unidad = await _residenteService.CrearUnidadAsync(request);
                return Ok(new { message = "Unidad residencial creada exitosamente", unidad });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("unidades/{id}")]
        public async Task<IActionResult> ActualizarUnidad(int id, [FromBody] ActualizarUnidadRequestDto request)
        {
            try
            {
                await _residenteService.ActualizarUnidadAsync(id, request);
                return Ok(new { message = "Unidad residencial actualizada exitosamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("unidades/{id}")]
        public async Task<IActionResult> EliminarUnidad(int id)
        {
            try
            {
                await _residenteService.EliminarUnidadAsync(id);
                return Ok(new { message = "Unidad residencial eliminada exitosamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetResidente(int id)
        {
            var residente = await _residenteService.ObtenerPorIdAsync(id);
            if (residente == null)
            {
                return NotFound(new { message = "Residente no encontrado." });
            }
            return Ok(new { residente });
        }

        [HttpPost]
        public async Task<IActionResult> CrearResidente([FromBody] CrearResidenteRequestDto request)
        {
            try
            {
                var residente = await _residenteService.CrearResidenteAsync(request);
                return Ok(new { message = "Residente creado exitosamente", residente });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarResidente(int id, [FromBody] ActualizarResidenteRequestDto request)
        {
            try
            {
                await _residenteService.ActualizarResidenteAsync(id, request);
                return Ok(new { message = "Residente actualizado exitosamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarResidente(int id)
        {
            try
            {
                await _residenteService.EliminarResidenteAsync(id);
                return Ok(new { message = "Residente eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
