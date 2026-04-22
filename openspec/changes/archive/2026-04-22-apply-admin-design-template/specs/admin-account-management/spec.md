## MODIFIED Requirements

### Requirement: 後台帳號列表

系統 SHALL 提供 API `GET /api/admin/users`，回傳所有帳號列表（含已刪除帳號以旗標標示），每筆資料包含：UserID、顯示名稱、角色、啟用狀態、已刪除旗標、目前綁定的登入方式（Google / Line / Email / 手機 / Account）。此 API 需要 `SystemAdmin` 或 `Nanny` 角色。前端以**卡片列表**形式顯示，並提供**搜尋框**（依名稱即時篩選）、**篩選按鈕**（依角色/狀態）、**分頁器**（每頁 10 筆）。

#### Scenario: 管理員查看帳號卡片列表

- **GIVEN** 用戶已登入且角色為 `SystemAdmin` 或 `Nanny`
- **WHEN** 用戶進入後台帳號管理頁（`/admin/users`）
- **THEN** 頁面顯示帳號卡片列表，每張卡片包含：頭像、名稱、身分標籤（保母/家長）、編輯按鈕；底部顯示分頁器

#### Scenario: 帳號列表搜尋功能

- **GIVEN** 管理員在帳號管理頁
- **WHEN** 管理員在搜尋框輸入關鍵字
- **THEN** 列表即時（debounce 300ms）篩選只顯示名稱含關鍵字的帳號，分頁重置至第 1 頁

#### Scenario: 無權限用戶無法存取帳號管理 API

- **GIVEN** 用戶已登入但角色為 `Parent`
- **WHEN** 用戶呼叫 `GET /api/admin/users`
- **THEN** 系統回傳 HTTP 403 Forbidden
