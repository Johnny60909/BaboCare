## ADDED Requirements

### Requirement: 後台帳號列表

系統 SHALL 提供 API `GET /api/admin/users`，回傳所有帳號列表（含已刪除帳號以旗標標示），每筆資料包含：UserID、顯示名稱、角色、啟用狀態、已刪除旗標、目前綁定的登入方式（Google / Line / Email / 手機 / Account）。此 API 需要 `SystemAdmin` 或 `Nanny` 角色。前端顯示為表格列表。

#### Scenario: 管理員查看帳號列表

- **GIVEN** 用戶已登入且角色為 `SystemAdmin` 或 `Nanny`
- **WHEN** 用戶進入後台帳號管理頁（`/admin/accounts`）
- **THEN** 頁面顯示所有用戶的表格，欄位包含名稱、角色、狀態、登入方式

#### Scenario: 無權限用戶無法存取帳號管理 API

- **GIVEN** 用戶已登入但角色為 `Parent`
- **WHEN** 用戶呼叫 `GET /api/admin/users`
- **THEN** 系統回傳 HTTP 403 Forbidden

### Requirement: 後台建立帳號

系統 SHALL 提供 API `POST /api/admin/users`，接受欄位：顯示名稱（必填）、性別、Email、手機、Account（帳號名稱）、初始密碼（可選）、角色（`SystemAdmin` / `Nanny` / `Parent`）、啟用狀態。建立時若 Account 未提供，系統 SHALL 自動以 UUID 產生唯一 UserName。

#### Scenario: 成功建立佔位帳號

- **GIVEN** 管理員已登入後台
- **WHEN** 管理員填寫顯示名稱與 Email，提交建立表單
- **THEN** 系統建立帳號並回傳 HTTP 201，帳號出現在列表中

#### Scenario: 建立帳號時 Email 已存在

- **GIVEN** 管理員嘗試建立帳號，輸入已存在的 Email
- **WHEN** 管理員提交建立表單
- **THEN** 系統回傳 HTTP 400，說明 Email 已被使用

#### Scenario: Account 未提供時自動產生 UserName

- **GIVEN** 管理員建立帳號時未填寫 Account 欄位
- **WHEN** 系統建立帳號
- **THEN** 系統自動以 UUID 作為 UserName，帳號成功建立

### Requirement: 後台編輯帳號

系統 SHALL 提供 API `PUT /api/admin/users/{id}`，可更新顯示名稱、性別、Email、手機、角色、啟用狀態。

#### Scenario: 成功更新帳號資料

- **GIVEN** 管理員已登入後台
- **WHEN** 管理員修改用戶的顯示名稱並提交
- **THEN** 系統更新資料並回傳 HTTP 200

#### Scenario: 更新不存在的帳號

- **GIVEN** 管理員提交更新請求，但帳號 ID 不存在
- **WHEN** API 收到請求
- **THEN** 系統回傳 HTTP 404

### Requirement: 後台停用與啟用帳號

系統 SHALL 提供 API `PATCH /api/admin/users/{id}/status`，接受 `isActive` 布林值，可切換帳號停用/啟用狀態。停用帳號不可登入系統，但資料保留。

#### Scenario: 停用帳號後無法登入

- **GIVEN** 管理員將目標帳號停用（`isActive=false`）
- **WHEN** 被停用帳號嘗試登入
- **THEN** 系統回傳登入失敗訊息，拒絕發放 Token

#### Scenario: 重新啟用後可以登入

- **GIVEN** 管理員將帳號重新啟用（`isActive=true`）
- **WHEN** 用戶使用正確憑證登入
- **THEN** 系統正常發放 Token

### Requirement: 後台刪除帳號（軟刪除）

系統 SHALL 提供 API `DELETE /api/admin/users/{id}`，執行軟刪除（設定 `IsDeleted=true`），不從資料庫物理移除。已刪除帳號在列表以旗標標示，無法登入。

#### Scenario: 刪除帳號後在列表顯示刪除標記

- **GIVEN** 管理員點擊刪除按鈕並確認
- **WHEN** API 執行軟刪除
- **THEN** 帳號在列表以「已刪除」狀態顯示，系統回傳 HTTP 200

#### Scenario: 已刪除帳號無法登入

- **GIVEN** 帳號 `IsDeleted=true`
- **WHEN** 用戶嘗試使用該帳號登入
- **THEN** 系統回傳登入失敗訊息

### Requirement: 後台路由需要管理員或保母角色

前端 `/admin/**` 路由 SHALL 受 `ProtectedRoute` 保護，要求 JWT 中包含 `SystemAdmin` 或 `Nanny` 角色。不符合時導向首頁 `/`。

#### Scenario: 無管理員角色用戶訪問後台路由

- **GIVEN** 用戶已登入但角色為 `Parent`
- **WHEN** 用戶直接輸入網址 `/admin/accounts`
- **THEN** 系統自動導向 `/`（首頁）
