using ElMolino.Application.DTOs;
using ElMolino.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ElMolino.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            try
            {
                var response = await _authService.AuthenticateAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] SolicitarResetDto request)
        {
            // Siempre respondemos OK para no revelar si el email existe
            await _authService.SolicitarResetPasswordAsync(request);
            return Ok(new { message = "Si el correo está registrado, recibirás las instrucciones en breve." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ConfirmarResetDto request)
        {
            try
            {
                await _authService.ConfirmarResetPasswordAsync(request);
                return Ok(new { message = "Contraseña restablecida exitosamente. Ya puedes iniciar sesión." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
