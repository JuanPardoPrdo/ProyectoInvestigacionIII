using ElMolino.Application.DTOs;
using ElMolino.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ElMolino.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Exigir JWT
    public class ReservasController : ControllerBase
    {
        private readonly IReservaService _reservaService;

        public ReservasController(IReservaService reservaService)
        {
            _reservaService = reservaService;
        }

        private int ObtenerIdPersonaToken()
        {
            var claimStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(claimStr) || !int.TryParse(claimStr, out int id))
                throw new UnauthorizedAccessException("Token inválido.");
            return id;
        }

        private string ObtenerRolToken()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value ?? "";
        }

        [HttpGet("recursos")]
        public async Task<IActionResult> GetRecursos()
        {
            var recursos = await _reservaService.ObtenerRecursosDisponiblesAsync();
            return Ok(new { recursos });
        }

        [HttpGet]
        public async Task<IActionResult> GetReservas()
        {
            var rol = ObtenerRolToken();
            var idPersona = ObtenerIdPersonaToken();

            List<ReservaDto> reservas;
            if (rol == "Administrador")
            {
                reservas = await _reservaService.ObtenerReservasAsync();
            }
            else
            {
                reservas = await _reservaService.ObtenerReservasAsync(idPersona);
            }

            return Ok(new { reservas });
        }

        [HttpPost]
        public async Task<IActionResult> CrearReserva([FromBody] CrearReservaRequestDto request)
        {
            try
            {
                var idPersona = ObtenerIdPersonaToken();
                var reserva = await _reservaService.CrearReservaAsync(request, idPersona);
                return Ok(new { message = "Reserva creada exitosamente", reserva });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarReserva(int id, [FromBody] ActualizarReservaRequestDto request)
        {
            try
            {
                var idPersona = ObtenerIdPersonaToken();
                var rol = ObtenerRolToken();
                await _reservaService.ActualizarReservaAsync(id, request, idPersona, rol);
                return Ok(new { message = "Reserva actualizada exitosamente" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelarReserva(int id)
        {
            try
            {
                var idPersona = ObtenerIdPersonaToken();
                await _reservaService.CancelarReservaAsync(id, idPersona);
                return Ok(new { message = "Reserva cancelada" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
