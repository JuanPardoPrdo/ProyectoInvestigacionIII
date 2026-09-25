using ElMolino.Application.DTOs;

namespace ElMolino.Application.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto> AuthenticateAsync(LoginRequestDto request);
        Task SolicitarResetPasswordAsync(SolicitarResetDto request);
        Task ConfirmarResetPasswordAsync(ConfirmarResetDto request);
    }
}
