## MODIFIED Requirements

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
