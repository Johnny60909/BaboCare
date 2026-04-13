## ADDED Requirements

### Requirement: 用戶可以使用帳號密碼登入

系統 SHALL 提供登入端點（`POST /connect/token`），由 `BaboCare.Identity`（`http://localhost:5080`）負責處理，接受 `username`、`password` 與 `grant_type=password`，驗證成功後同時發放 Access Token 與 Refresh Token。Access Token 以明文 JWT 格式發出（`DisableAccessTokenEncryption`）。Token 中 SHALL 包含用戶角色（`role` Claim，值為 `SystemAdmin`、`Nanny` 或 `Parent`）。已停用（`IsActive=false`）或已刪除（`IsDeleted=true`）的帳號 SHALL 被拒絕，回傳 HTTP 400。

前端 SHALL 使用環境變數 `VITE_IDENTITY_URL` 作為 auth endpoint 的 base URL，與業務 API（`VITE_API_URL`）分開設定。

#### Scenario: 帳號密碼正確時登入成功

- **GIVEN** 用戶帳號存在於系統中且密碼正確，且帳號為啟用狀態
- **WHEN** 用戶提交正確的帳號與密碼至 `VITE_IDENTITY_URL/connect/token`
- **THEN** 系統回傳 HTTP 200，並包含 `access_token`（明文 JWT，含 `role` Claim）、`refresh_token`、`token_type`、`expires_in`

#### Scenario: 密碼錯誤時登入失敗

- **GIVEN** 用戶帳號存在於系統中
- **WHEN** 用戶提交錯誤的密碼
- **THEN** 系統回傳 HTTP 400，並包含錯誤說明

#### Scenario: 帳號不存在時登入失敗

- **GIVEN** 帳號不存在於系統中
- **WHEN** 用戶提交不存在的帳號
- **THEN** 系統回傳 HTTP 400，並包含錯誤說明

#### Scenario: 帳號已停用時登入失敗

- **GIVEN** 帳號存在但 `IsActive=false`
- **WHEN** 用戶嘗試登入
- **THEN** 系統回傳 HTTP 400，說明帳號已停用

#### Scenario: 帳號已刪除時登入失敗

- **GIVEN** 帳號 `IsDeleted=true`
- **WHEN** 用戶嘗試登入
- **THEN** 系統回傳 HTTP 400，說明帳號不存在或已刪除

### Requirement: 系統拒絕未登入用戶存取受保護資源

`BaboCare.Api` SHALL 對所有受保護 API 端點要求有效的 Bearer Token，透過 OpenIddict Validation（`SetIssuer("http://localhost:5080/")`）遠端驗證 JWT，無效或缺少 Token 時回傳 HTTP 401。

#### Scenario: 無 Token 存取受保護端點

- **GIVEN** 用戶未登入（無 Token）
- **WHEN** 用戶存取受保護的 API 端點
- **THEN** 系統回傳 HTTP 401 Unauthorized

#### Scenario: 無效 Token 存取受保護端點

- **GIVEN** 用戶攜帶過期或無效的 Token
- **WHEN** 用戶存取受保護的 API 端點
- **THEN** 系統回傳 HTTP 401 Unauthorized

### Requirement: 前端未登入時自動導向登入頁

前端 SHALL 對所有受保護路由（除 `/login` 外）實作路由守衛，未登入時自動導向 `/login`。登入頁面 SHALL 提供帳號密碼登入與邀請碼驗證兩條主要路徑，允許未驗證的用戶直接導向驗證頁面進行邀請碼驗證。

#### Scenario: 未登入直接訪問首頁

- **GIVEN** 用戶瀏覽器中無有效 Token
- **WHEN** 用戶導航至 `/`（首頁）
- **THEN** 系統自動導向 `/login`

#### Scenario: 帳號激活後導向登入頁

- **GIVEN** 用戶已完成邀請碼驗證（在 `/activate` 頁面）
- **WHEN** 驗證成功，系統導向 `/login`
- **THEN** 登入頁面顯示成功提示「帳號已成功啟用！請使用帳號密碼登入」，並預填用戶名

#### Scenario: 用戶已啟用帳號時正常登入

- **GIVEN** 用戶在登入頁填寫已啟用帳號的帳號與密碼
- **WHEN** 登入 API（`VITE_IDENTITY_URL/connect/token`）回傳成功
- **THEN** 前端儲存 Token 並導向 `/`

### Requirement: 前端自動使用 Refresh Token 換取新 Access Token

前端 SHALL 在 Access Token 過期（API 回傳 401）時，自動使用 Refresh Token 呼叫 `VITE_IDENTITY_URL/connect/token`（`grant_type=refresh_token`）換取新 Token，換取成功後重試原始請求。

#### Scenario: Access Token 過期時自動換新

- **GIVEN** 用戶持有有效的 Refresh Token，但 Access Token 已過期
- **WHEN** 前端發出任意 API 請求後收到 HTTP 401
- **THEN** 前端自動向 `VITE_IDENTITY_URL/connect/token` 換取新 Access Token 與 Refresh Token，並重試原始請求，用戶無感知

#### Scenario: Refresh Token 過期時導向登入頁

- **GIVEN** 用戶的 Refresh Token 已過期或被撤銷
- **WHEN** 前端嘗試使用 Refresh Token 換取新 Token 時收到錯誤
- **THEN** 前端清除所有 Token 並導向 `/login`

### Requirement: 首頁為登入後可見的空白 Dashboard

系統 SHALL 在 `/` 路徑渲染一個空白的 Dashboard 頁面，已登入用戶可正常進入，頁面目前不含任何功能內容。

#### Scenario: 已登入用戶訪問首頁

- **GIVEN** 用戶已登入並持有有效 Token
- **WHEN** 用戶導航至 `/`
- **THEN** 系統顯示首頁（空白 Dashboard），不發生重新導向
