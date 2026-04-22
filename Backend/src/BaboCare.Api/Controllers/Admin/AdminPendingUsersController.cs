using BaboCare.Application.Dtos.PendingUsers;
using BaboCare.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaboCare.Api.Models;

namespace BaboCare.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/pending-users")]
[Authorize(Roles = "SystemAdmin,Nanny")]
public class AdminPendingUsersController : ControllerBase
{
    private readonly IPendingAccountService _pendingService;

    public AdminPendingUsersController(IPendingAccountService pendingService)
    {
        _pendingService = pendingService;
    }

    // GET /api/admin/pending-users
    [HttpGet]
    public async Task<List<PendingUserListDto>> GetPendingUsers()
    {
        return await _pendingService.GetPendingUsersAsync();
    }

    // POST /api/admin/pending-users/{id}/generate-invite
    [HttpPost("{id}/generate-invite")]
    public async Task<object> GenerateInvite(string id)
    {
        var code = await _pendingService.GenerateInviteCodeAsync(id);
        return new { code };
    }

    // DELETE /api/admin/pending-users/{id}
    [HttpDelete("{id}")]
    public async Task DeletePendingUser(string id)
    {
        await _pendingService.RemovePendingUserAsync(id);
    }
}
