## Context

BaboCare 是一個保母托育紀錄系統，目前處於初始建置階段。本次變更為系統第一個功能：身份驗證（登入）。系統採用 .NET 10 後端 + React 前端架構，使用 OpenIddict Password Flow 作為 OAuth2 Token 發放機制，搭配 ASP.NET Core Identity 管理用戶。

目前系統無任何既有功能，此設計為全新建置。

**專案結構**:
- 後端: `./Backend/`
- 前端: `./Frontend/`

**資料庫連線**（開發環境）:
- Host: `localhost:5432`
- 帳號: `admin` / 密碼: `password`
- Connection String 存放於 `Backend/appsettings.Development.json`

## Goals / Non-Goals

**Goals:**
- 建立 OpenIddict Password Grant 身份驗證後端
- 建立用戶登入 API（`POST /connect/token`）
- 建立前端登入頁面（帳號 + 密碼表單）
- 實作受保護路由，未登入時導向 `/login`
- 首頁（`/`）為空白 Dashboard，登入後可進入

**Non-Goals:**
- 用戶註冊功能（本次不實作，由 seed data 預建資料）
- 忘記密碼 / 重設密碼
- 第三方 OAuth（Google、LINE 等）
- 角色權限管理（RBAC）

## Decisions

### D1: 使用 OpenIddict Password Flow

**決定**: 採用 OpenIddict 實作 OAuth2 Password Grant。

**理由**: `tech-identity.md` 已明確規範使用 OpenIddict Password Flow。相較於手刻 JWT 發放，OpenIddict 提供符合 OAuth2 規範的端點（`/connect/token`），並與 EF Core + PostgreSQL 完整整合。

**替代方案**: 手刻 `JwtBearer` → 排除，因為需自行管理 Token 生命週期與 claims，維護成本高。

### D2: Token 存放於 localStorage

**決定**: 前端將 JWT Access Token 存放於 `localStorage`。

**理由**: 簡單直接，適合 SPA + REST API 架構。Axios interceptor 在每次請求時自動附加 `Authorization: Bearer <token>`。

**風險**: XSS 攻擊可能竊取 Token。本系統為保母內部工具，風險等級可接受，後續可升級為 httpOnly Cookie。

### D3: 資料庫 ID 使用 ULID

**決定**: 所有實體（包含 Identity User）的主鍵使用 ULID 字串型態。

**理由**: 符合 `tech-backend.md` 規範。ULID 具備時序性，適合分散式環境，同時避免 GUID 無序帶來的索引效能問題。

### D4: Seed Data 預建保母帳號

**決定**: 透過 EF Core Seed 或 `IHostedService` 在應用程式啟動時建立預設測試帳號。

**理由**: 本次不實作註冊功能，需要有方式取得可用帳號進行測試。

### D5: Token 有效期由 appsettings 管理

**決定**: OpenIddict Access Token 有效期（`AccessTokenLifetime`）與 Refresh Token 有效期（`RefreshTokenLifetime`）均設定於 `Backend/appsettings.json`，不硬編碼於程式碼中。

**理由**: 允許不同環境（Development / Production）使用不同有效期，無需重新編譯。格式使用 `TimeSpan` 字串。

```json
"OpenIddict": {
  "AccessTokenLifetime": "00:15:00",
  "RefreshTokenLifetime": "7.00:00:00"
}
```

**替代方案**: 硬編碼於 `AddServer().SetAccessTokenLifetime()` → 排除，環境彈性差。

### D6: Refresh Token 機制

**決定**: 啟用 OpenIddict Refresh Token Grant，Access Token 有效期設為 15 分鐘，Refresh Token 有效期設為 7 天。

**理由**: Access Token 短效可降低洩漏風險；Refresh Token 允許用戶在不重新登入的情況下持續使用系統，符合保母長時間使用的情境。

**流程**: 前端 Axios response interceptor 攔截 401 錯誤 → 自動呼叫 `POST /connect/token`（`grant_type=refresh_token`）換取新 Access Token → 重試原始請求。Refresh Token 失敗（過期或撤銷）時清除 Token 並導向 `/login`。

**替代方案**: 純長效 Access Token → 排除，Token 洩漏後無法即時撤銷。

## Sequence Diagram

### 登入流程

```
Frontend (LoginPage)          Backend (/connect/token)       OpenIddict + Identity
        |                              |                              |
        |  POST /connect/token         |                              |
        |  {username, password,        |                              |
        |   grant_type=password}       |                              |
        |----------------------------->|                              |
        |                              |  ValidateUser(username,pwd) |
        |                              |----------------------------->|
        |                              |       User valid? Yes        |
        |                              |<-----------------------------|
        |                              |  Issue Access + Refresh Token|
        |                              |<-----------------------------|
        |  200 OK {access_token,       |                              |
        |   refresh_token, expires_in} |                              |
        |<-----------------------------|                              |
        |                              |                              |
   Store access_token + refresh_token  |                              |
   in localStorage                    |                              |
   Redirect to /                      |                              |
```

### Refresh Token 換新流程

```
Frontend (Axios interceptor)   Backend (/connect/token)
        |                              |
        |  GET /api/protected          |
        |  [Access Token expired]      |
        |----------------------------->|
        |  401 Unauthorized            |
        |<-----------------------------|
        |                              |
        |  POST /connect/token         |
        |  {grant_type=refresh_token,  |
        |   refresh_token=<token>}     |
        |----------------------------->|
        |  200 OK {new access_token,   |
        |          new refresh_token}  |
        |<-----------------------------|
        |                              |
   Update tokens in localStorage      |
        |  Retry original request      |
        |----------------------------->|
        |  200 OK (original response)  |
        |<-----------------------------|
```

### 受保護路由守衛

```
Browser                  React Router          localStorage
   |                          |                      |
   |  Navigate to /           |                      |
   |------------------------->|                      |
   |                          |  Check token exists  |
   |                          |--------------------->|
   |                          | token = null         |
   |                          |<---------------------|
   |  Redirect to /login      |                      |
   |<-------------------------|                      |
```

## Risks / Trade-offs

| 風險 | 緩解措施 |
|------|---------|
| Token 存於 localStorage 有 XSS 風險 | 系統為內部工具，後續可改用 httpOnly Cookie |
| OpenIddict 設定複雜，初次設定易出錯 | 參照官方 Password Flow 範例，並加入整合測試驗證 `/connect/token` |
| Seed 帳號密碼硬編碼於程式碼中 | 使用 `IConfiguration` 從 `appsettings.Development.json` 讀取，不寫死於程式碼 |
| 開發環境 DB 帳密（admin/password）外洩風險 | 開發環境帳密可納入版控（僅限 Development），Production 使用環境變數覆寫 |
| Refresh Token 遭竊可長期冒用 | Refresh Token 存放於 localStorage，風險與 Access Token 相同；後續可升級為 httpOnly Cookie |

## Migration Plan

1. 在 `Backend/appsettings.Development.json` 設定 DB Connection String（`localhost:5432`、`admin`/`password`）及 `OpenIddict.AccessTokenLifetime`、`OpenIddict.RefreshTokenLifetime`
2. 套件安裝：`OpenIddict`、`OpenIddict.AspNetCore`、`OpenIddict.EntityFrameworkCore`
3. 新增 EF Core Migration（Identity 資料表 + OpenIddict 資料表）
4. 執行 `dotnet ef database update`
5. 應用程式啟動時執行 Seed
6. 前端（`./Frontend/`）新增 `/login` 路由與受保護路由

**回滾策略**:
- 停用 `app.UseAuthentication()` / `app.UseAuthorization()` 可臨時關閉驗證
- `dotnet ef database update <migration-name>` 可回退資料庫

## Open Questions

- Seed 帳號資訊（帳號/密碼）從 `Backend/appsettings.Development.json` 讀取（已決定）
