using BaboCare.Application.Dtos;
using BaboCare.Domain.Entities;

namespace BaboCare.Application.Services;

public interface IPendingAccountService
{
    Task<PendingRegisterResponse> RegisterAsync(PendingRegisterRequest request);
    Task<PendingActivateResponse> ActivateAsync(PendingActivateRequest request);
    Task<List<PendingUserListDto>> GetPendingUsersAsync();
    Task<string> GenerateInviteCodeAsync(string pendingUserId);
    Task RemovePendingUserAsync(string pendingUserId);
}
