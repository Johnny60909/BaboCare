using BaboCare.Application.Dtos.Admin;
using BaboCare.Application.Dtos.Users;

namespace BaboCare.Application.Services;

public interface IAdminUserService
{
    Task<AdminStatsDto> GetAdminStatsAsync();
    Task<List<UserListDto>> GetUsersAsync();
    Task<UserDetailDto> GetUserAsync(string userId);
    Task<UserDetailDto> CreateUserAsync(string userName, string password, string? displayName = null, string? gender = null, string? email = null, string? phoneNumber = null, List<string>? roles = null, bool isActive = true);
    Task<UserDetailDto> UpdateUserAsync(string userId, string? displayName = null, string? gender = null, string? email = null, string? phoneNumber = null, bool? isActive = null, List<string>? roles = null);
    Task AssignRoleAsync(string userId, List<string> roles);
    Task<bool> DeleteUserAsync(string userId);
}
