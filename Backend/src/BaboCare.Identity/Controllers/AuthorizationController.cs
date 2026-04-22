using System.Security.Claims;
using BaboCare.Domain.Entities.Users;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace BaboCare.Identity.Controllers;

[ApiController]
public class AuthorizationController : ControllerBase
{
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly UserManager<ApplicationUser> _userManager;

    public AuthorizationController(
        SignInManager<ApplicationUser> signInManager,
        UserManager<ApplicationUser> userManager)
    {
        _signInManager = signInManager;
        _userManager = userManager;
    }

    /// <summary>
    /// 令牌端點 - 處理 OAuth2/OpenID Connect 令牌請求
    /// </summary>
    /// <returns>包含 access_token 和 refresh_token 的響應</returns>
    /// <remarks>
    /// 支援以下流程：
    /// 1. 密碼流程（Password Grant）：用戶名和密碼登入
    /// 2. 刷新令牌流程（Refresh Token Grant）：使用 refresh_token 獲取新的 access_token
    /// </remarks>
    [HttpPost("~/connect/token")]
    public async Task<IActionResult> Exchange()
    {
        /// <remarks>獲取 OpenID Connect 請求對象</remarks>
        var request = HttpContext.GetOpenIddictServerRequest()
            ?? throw new InvalidOperationException("The OpenID Connect request cannot be retrieved.");

        /// <summary>
        /// 處理密碼流程（用戶名密碼登入）
        /// </summary>
        if (request.IsPasswordGrantType())
        {
            var user = await _userManager.FindByNameAsync(request.Username!);
            if (user is null)
            {
                return Forbid(
                    authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                    properties: new AuthenticationProperties(
                        new Dictionary<string, string?>
                        {
                            [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.InvalidGrant,
                            [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "帳號或密碼錯誤。"
                        }));
            }

            if (user.IsDeleted || !user.IsActive)
            {
                return Forbid(
                    authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                    properties: new AuthenticationProperties(
                        new Dictionary<string, string?>
                        {
                            [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.InvalidGrant,
                            [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "帳號已停用或已刪除。"
                        }));
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password!, lockoutOnFailure: true);
            if (!result.Succeeded)
            {
                return Forbid(
                    authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                    properties: new AuthenticationProperties(
                        new Dictionary<string, string?>
                        {
                            [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.InvalidGrant,
                            [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "帳號或密碼錯誤。"
                        }));
            }

            var principal = await _signInManager.CreateUserPrincipalAsync(user);
            principal.SetScopes(new[] { Scopes.OpenId, Scopes.OfflineAccess });

            var identity = (ClaimsIdentity)principal.Identity!;
            identity.AddClaim(new Claim(Claims.Subject, user.Id));

            var roles = await _userManager.GetRolesAsync(user);
            foreach (var role in roles)
                identity.AddClaim(new Claim(Claims.Role, role));

            foreach (var claim in principal.Claims)
                claim.SetDestinations(GetDestinations(claim, principal));

            return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

        if (request.IsRefreshTokenGrantType())
        {
            var result = await HttpContext.AuthenticateAsync(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
            var userId = result.Principal?.GetClaim(Claims.Subject);
            var user = userId is not null ? await _userManager.FindByIdAsync(userId) : null;

            if (user is null)
            {
                return Forbid(
                    authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                    properties: new AuthenticationProperties(
                        new Dictionary<string, string?>
                        {
                            [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.InvalidGrant,
                            [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "Refresh Token 無效。"
                        }));
            }

            var principal = await _signInManager.CreateUserPrincipalAsync(user);
            principal.SetScopes(result.Principal!.GetScopes());

            var identity = (ClaimsIdentity)principal.Identity!;
            identity.AddClaim(new Claim(Claims.Subject, user.Id));

            var refreshRoles = await _userManager.GetRolesAsync(user);
            foreach (var role in refreshRoles)
                identity.AddClaim(new Claim(Claims.Role, role));

            foreach (var claim in principal.Claims)
                claim.SetDestinations(GetDestinations(claim, principal));

            return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

        return BadRequest(new OpenIddictResponse
        {
            Error = Errors.UnsupportedGrantType,
            ErrorDescription = "不支援的 grant type。"
        });
    }

    /// <summary>
    /// 確定聲明應該包含在哪些令牌中
    /// </summary>
    /// <param name="claim">要檢查的聲明</param>
    /// <param name="principal">聲明主體，用於檢查授權範圍</param>
    /// <returns>聲明應該包含的令牌類型列表</returns>
    /// <remarks>
    /// 規則：
    /// - Name：包含在 AccessToken 中，在有 Profile 範圍時也包含在 IdentityToken
    /// - Subject：同時包含在 AccessToken 和 IdentityToken
    /// - 其他：只包含在 AccessToken
    /// </remarks>
    private static IEnumerable<string> GetDestinations(Claim claim, ClaimsPrincipal principal)
    {
        switch (claim.Type)
        {
            case Claims.Name:
                yield return Destinations.AccessToken;
                if (principal.HasScope(Scopes.Profile))
                    yield return Destinations.IdentityToken;
                yield break;

            case Claims.Subject:
                yield return Destinations.AccessToken;
                yield return Destinations.IdentityToken;
                yield break;

            case Claims.Role:
                yield return Destinations.AccessToken;
                yield return Destinations.IdentityToken;
                yield break;

            default:
                yield return Destinations.AccessToken;
                yield break;
        }
    }
}
