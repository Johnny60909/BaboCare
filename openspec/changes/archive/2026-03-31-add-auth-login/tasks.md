## 1. 後端：套件安裝與基礎設定

- [x] 1.1 在 `Backend/appsettings.Development.json` 設定 DB Connection String（`Host=localhost;Port=5432;Username=admin;Password=password;Database=babocare`）
- [x] 1.2 在 `Backend/appsettings.json` 加入 `OpenIddict` 設定區塊（含 `AccessTokenLifetime: "00:15:00"`、`RefreshTokenLifetime: "7.00:00:00"`）
- [x] 1.3 安裝 NuGet 套件（於 `Backend/` 目錄下）：`Microsoft.AspNetCore.Identity.EntityFrameworkCore`、`OpenIddict`、`OpenIddict.AspNetCore`、`OpenIddict.EntityFrameworkCore`
- [x] 1.4 建立 `ApplicationUser` 類別（繼承 `IdentityUser<string>`，使用 ULID 字串作為主鍵）
- [x] 1.5 建立 `AppDbContext`，繼承 `IdentityDbContext<ApplicationUser>`，並加入 OpenIddict Entity Sets
- [x] 1.6 在 `Program.cs` 註冊 ASP.NET Core Identity（使用 `ApplicationUser`）
- [x] 1.7 在 `Program.cs` 設定 OpenIddict（Password Flow + Refresh Token Flow、Token 存放於 PostgreSQL），從 `IConfiguration` 讀取 `OpenIddict:AccessTokenLifetime` 與 `OpenIddict:RefreshTokenLifetime`
- [x] 1.8 在 `Program.cs` 加入 `UseAuthentication()` 與 `UseAuthorization()` 中介軟體

## 2. 後端：資料庫 Migration

- [x] 2.1 在 `Backend/` 目錄下新增 EF Core Migration，產生 Identity 資料表與 OpenIddict 資料表
- [x] 2.2 執行 `dotnet ef database update` 套用 Migration（連線至 `localhost:5432`）

## 3. 後端：Seed 預設帳號

- [x] 3.1 建立 `DbSeeder` 服務（`IHostedService` 或 `IHostApplicationLifetime`），從 `appsettings.Development.json` 讀取預設帳號資訊
- [x] 3.2 在 `Backend/appsettings.Development.json` 加入 Seed 帳號設定區塊（帳號、密碼）
- [x] 3.3 `DbSeeder` 在應用程式啟動時建立預設保母帳號（若不存在）
- [x] 3.4 在 `Program.cs` 註冊並啟動 `DbSeeder`

## 4. 後端：OpenIddict Token 端點

- [x] 4.1 建立 `AuthorizationController`，實作 `POST /connect/token` 端點
- [x] 4.2 端點處理 Password Grant：驗證 `username` + `password`，呼叫 `SignInManager`
- [x] 4.3 驗證成功時建立 ClaimsPrincipal 並透過 OpenIddict 同時發放 Access Token 與 Refresh Token
- [x] 4.4 實作 `grant_type=refresh_token` 處理：驗證 Refresh Token 有效性，成功時發放新 Access Token 與新 Refresh Token
- [x] 4.5 驗證失敗時回傳標準 OAuth2 錯誤回應（HTTP 400）

## 5. 前端：專案結構與路由設定（`./Frontend/`）

- [x] 5.1 建立 `Frontend/src/pages/LoginPage.tsx` 空白元件
- [x] 5.2 建立 `Frontend/src/pages/DashboardPage.tsx` 空白元件（首頁）
- [x] 5.3 在 `Frontend/src/router.tsx`（或 `App.tsx`）設定路由：`/login` → `LoginPage`、`/` → `DashboardPage`
- [x] 5.4 建立 `Frontend/src/components/ProtectedRoute.tsx`，讀取 localStorage Token，無 Token 時導向 `/login`
- [x] 5.5 將 `/` 路由包裝於 `ProtectedRoute` 內

## 6. 前端：Token 管理與 Axios 設定

- [x] 6.1 建立 `Frontend/src/lib/auth.ts`，提供 `getToken()`、`setToken()`、`removeToken()`、`getRefreshToken()`、`setRefreshToken()` 工具函式（操作 localStorage）
- [x] 6.2 建立 `Frontend/src/lib/apiClient.ts`，設定 Axios instance，加入 request interceptor 自動附加 `Authorization: Bearer <token>`
- [x] 6.3 在 `apiClient.ts` 加入 response interceptor：攔截 401 → 呼叫 `/connect/token`（`grant_type=refresh_token`）換新 Token → 重試原始請求；換新失敗時清除 Token 並導向 `/login`

## 7. 前端：登入頁面實作

- [x] 7.1 在 `Frontend/src/pages/LoginPage.tsx` 使用 Mantine UI 建立登入表單（帳號輸入欄、密碼輸入欄、登入按鈕）
- [x] 7.2 建立 `Frontend/src/hooks/useLogin.ts` Custom Hook，呼叫 `POST /connect/token`（使用 apiClient）
- [x] 7.3 登入成功時呼叫 `setToken()` 與 `setRefreshToken()` 分別儲存 Access Token 與 Refresh Token，並導向 `/`
- [x] 7.4 登入失敗時在表單顯示錯誤訊息（使用 Mantine `notifications` 或 inline error）
- [x] 7.5 已登入用戶訪問 `/login` 時自動導向 `/`

## 8. 驗證與測試

- [x] 8.1 手動測試：使用 Seed 帳號正確登入，確認 Token 取得與首頁跳轉
- [x] 8.2 手動測試：輸入錯誤密碼，確認錯誤訊息顯示
- [x] 8.3 手動測試：未登入直接訪問 `/`，確認被導向 `/login`
