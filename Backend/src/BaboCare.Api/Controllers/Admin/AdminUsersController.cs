using BaboCare.Application.Dtos;
using BaboCare.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaboCare.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "SystemAdmin,Nanny")]
public class AdminUsersController : ControllerBase
{
    private readonly IAdminUserService _userService;

    public AdminUsersController(IAdminUserService userService)
    {
        _userService = userService;
    }

    // GET /api/admin/users
    [HttpGet]
    public async Task<List<UserListDto>> GetUsers()
    {
        return await _userService.GetUsersAsync();
    }

    // POST /api/admin/users
    [HttpPost]
    public async Task<UserDetailDto> CreateUser([FromBody] CreateUserRequest req)
    {
        return await _userService.CreateUserAsync(
            req.UserName,
            req.Password,
            req.DisplayName,
            req.Gender,
            req.Email,
            req.PhoneNumber,
            req.Roles,
            req.IsActive
        );
    }

    // GET /api/admin/users/{id}
    [HttpGet("{id}")]
    public async Task<UserDetailDto> GetUser(string id)
    {
        return await _userService.GetUserAsync(id);
    }

    // PUT /api/admin/users/{id}
    [HttpPut("{id}")]
    public async Task<UserDetailDto> UpdateUser(string id, [FromBody] UpdateUserRequest req)
    {
        return await _userService.UpdateUserAsync(
            id,
            req.DisplayName,
            req.Gender,
            req.Email,
            req.PhoneNumber,
            req.IsActive,
            req.Roles
        );
    }

    // PATCH /api/admin/users/{id}/status - 切換啟用/停用狀態
    [HttpPatch("{id}/status")]
    public async Task<object> ToggleStatus(string id)
    {
        var user = await _userService.GetUserAsync(id);
        var newStatus = !user.IsActive;
        await _userService.UpdateUserAsync(id, isActive: newStatus);
        return new { id, isActive = newStatus };
    }

    // DELETE /api/admin/users/{id}
    [HttpDelete("{id}")]
    public async Task DeleteUser(string id)
    {
        await _userService.DeleteUserAsync(id);
    }
}
