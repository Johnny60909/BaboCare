## MODIFIED Requirements

### Requirement: 前端未登入時自動導向登入頁

前端 SHALL 對所有受保護路由（除 `/login` 外）實作路由守衛，未登入時自動導向 `/login`。登入頁面專注於帳號密碼驗證，**不應**包含驗證碼相關的 UI 元素。若用戶帳號尚未通過邀請碼驗證，應通過適當的提示和連結指引其前往 `/activate` 頁面。

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

#### Scenario: 用戶嘗試使用未驗證帳號登入

- **GIVEN** 用戶在登入頁填寫未驗證帳號的帳號與密碼
- **WHEN** 登入 API 回傳 HTTP 400（帳號未驗證）
- **THEN** 前端顯示錯誤提示，並建議用戶前往 `/activate` 頁面進行驗證
