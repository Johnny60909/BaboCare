## 1. 資料庫與後端基礎建設

- [x] 1.1 擴充 `ApplicationUser`：新增 `DisplayName`、`Gender`、`IsActive`、`IsDeleted` 欄位
- [x] 1.2 建立 `PendingUser` 實體（`BaboCare.Domain`）：`Id`、`Source`（enum: Google/Line/Account）、`ProviderKey`、`Email`、`DisplayName`、`AvatarUrl`、`PhoneNumber`、`UserName`（自填帳號）、`PasswordHash`、`InviteCode`、`InviteCodeExpiry`、`InviteCodeAttempts`、`CreatedAt`
- [x] 1.3 建立 EF Core Migration：`AddUserProfileAndPendingUsers`；補充 `AddColumnLengthConstraints`（Id varchar(26)、各字串欄位長度限制）
- [x] 1.4 建立 Identity Roles 種子資料：`SystemAdmin`、`Nanny`、`Parent`
- [x] 1.5 在 `BaboCare.Identity` 的 Password Grant handler 中檢查 `IsActive` 與 `IsDeleted`，停用/刪除帳號拒絕發放 Token
- [x] 1.6 在 OpenIddict Token 產生流程中加入 `role` Claim

## 2. 後端已啟用帳號管理 API（BaboCare.Api）

- [x] 2.1 建立 `AdminUsersController`，路由 `/api/admin/users`，加入 `[Authorize(Roles = "SystemAdmin,Nanny")]`（逗號為 OR，任一角色即可）
- [x] 2.2 實作 `GET /api/admin/users`：回傳已啟用帳號列表（含 `DisplayName`、`Roles`、`IsActive`、`ExternalLogins` 列表）
- [x] 2.3 實作 `POST /api/admin/users`：直接建立員工帳號（`SystemAdmin`、`Nanny`）或情境 A 家長帳號（含 Email/手機），預設 `IsActive = true`，寫入 `ApplicationUser`
- [x] 2.4 實作 `PUT /api/admin/users/{id}`：更新帳號基本資料（`DisplayName`、`Gender`、`Email`、`PhoneNumber`）與角色
- [x] 2.5 實作 `PATCH /api/admin/users/{id}/status`：切換 `IsActive`
- [x] 2.6 實作 `DELETE /api/admin/users/{id}`：軟刪除（`IsDeleted = true`）

## 3. 後端待匹配 API（BaboCare.Api）

- [x] 3.1 實作 `GET /api/admin/pending-users`：回傳 `PendingUsers` 列表（頭像、來源、Email、DisplayName、建立時間）
- [x] 3.2 實作 `POST /api/admin/pending-users/{id}/generate-invite`：對指定 PendingUser 產生 8 位 `InviteCode`，過期天數從 `appsettings` 的 `InviteCode:ExpiryDays` 讀取（預設 30 天），舊碼失效
- [x] 3.3 實作 `DELETE /api/admin/pending-users/{id}`：刪除 PendingUser 記錄（管理員拒絕/清理）

## 4. 帳號綁定 API（BaboCare.Identity）

- [x] 4.1 實作 `POST /api/account/pending/register`（情境 C）：接收家長自填基礎資料（名稱、Email/手機、密碼），寫入 `PendingUsers`（`Source = Account`，`PasswordHash`），返回 `pendingUserId`
- [x] 4.2 實作 `POST /api/account/pending/activate`：以 `PendingUserId`（可省略）或 `InviteCode` 查找 `PendingUsers`，驗證未過期且嘗試次數 ≤ 5；成功後執行搜移轉換：建立 `ApplicationUser`（UserName 優先順序：自填帳號 → Email → 手機 → ULID）+ 指派 `Parent` 角色 + 轉移密碼 hash + 刪除 `PendingUser` → 回傳 `{ userName }`，前端跳轉 `/login?activated=1`
- [x] 4.3 在 `appsettings.json` / `appsettings.Development.json` 新增 `InviteCode:ExpiryDays` 設定，并在 `generate-invite` 中注入讀取
- [ ] 4.4 （延後 - OAuth change）新增 Google OAuth handler，實作 Callback 三段比對
- [ ] 4.5 （延後 - OAuth change）新增 Line OAuth handler，支援 PendingUser 創建（情境 B）
- [ ] 4.6 （延後 - OAuth change）已啟用帳號的多重 OAuth 綁定：`POST /api/account/link-provider`

## 5. 前端底部導覽列

- [x] 5.1 建立 `BottomNavigation` 元件（Mantine + Tailwind），登入後在所有主頁面底部顯示
- [x] 5.2 在 `router.tsx` 的主頁面 Layout 中掛載 `BottomNavigation`，登入頁排除
- [x] 5.3 實作角色判斷 Hook（`useUserRoles`）：解析 JWT `role` Claim
- [x] 5.4 `BottomNavigation` 根據 `useUserRoles` 條件顯示「後台管理」Icon（`lucide-react`，具備 `SystemAdmin` 或 `Nanny` 任一角色即可見）

## 6. 前端後台路由與保護

- [x] 6.1 擴充 `ProtectedRoute` 元件，支援 `requiredRoles` prop，不符角色導向 `/`
- [x] 6.2 在 `router.tsx` 新增 `/admin` 路由群組，套用角色保護（`SystemAdmin` 或 `Nanny`）
- [x] 6.3 建立後台 Layout 元件（`AdminLayout`），包含頁面標題與返回導覽

## 7. 前端已啟用帳號管理頁面

- [x] 7.1 建立 `AdminAccountsPage`（`/admin/accounts`）：Tab 切換「帳號列表」與「待匹配列表」
- [x] 7.2 實作查詢 Hook `useAdminUsers`（TanStack Query，呼叫 `GET /api/admin/users`）
- [x] 7.3 建立新增帳號 Drawer/Modal 表單：欄位包含顯示名稱、性別、Email、手機、Account、角色
- [x] 7.4 實作 `useCreateUser` mutation Hook（`POST /api/admin/users`）
- [x] 7.5 建立編輯帳號 Drawer/Modal，預填現有資料
- [x] 7.6 實作 `useUpdateUser` mutation Hook（`PUT /api/admin/users/{id}`）
- [x] 7.7 實作停用/啟用按鈕（`PATCH /api/admin/users/{id}/status`）
- [x] 7.8 實作刪除按鈕（含確認 Dialog）（`DELETE /api/admin/users/{id}`）

## 8. 前端待匹配列表頁面

- [x] 8.1 實作查詢 Hook `useAdminPendingUsers`（呼叫 `GET /api/admin/pending-users`）
- [x] 8.2 建立待匹配列表 UI：顯示頭像、來源 Badge（Google/LINE/Account）、Email、名稱、建立時間
- [x] 8.3 實作「產生邀請碼」按鈕（`POST /api/admin/pending-users/{id}/generate-invite`）並顯示邀請碼 + 複製按鈕
- [x] 8.4 實作「刪除」按鈕（含確認 Dialog）（`DELETE /api/admin/pending-users/{id}`）

## 9. 前端帳號綁定與初次登入頁面

- [x] 9.1 在登入頁新增「初次登入（自行申請）」入口（情境 C）
- [x] 9.2 建立初次登入表單頁：填寫名稱、Email/手機、密碼 → 呼叫 `POST /api/account/pending/register` → 跳轉 `/pending`
- [x] 9.3 建立 `/pending` 頁面：顯示「尚未獲得授權」或「等待授權中」說明 + 邀請碼輸入框
- [x] 9.4 實作 `useActivatePendingAccount` mutation Hook（`POST /api/account/pending/activate`）
- [ ] 9.5 （延後 - OAuth change）登入頁新增 Google / Line 登入按鈕
- [ ] 9.6 （延後 - OAuth change）登入後首頁 OAuth 綁定提醒橫幅

## 10. 測試與驗證

- [x] 10.1 手動測試情境 A：保母建立家長帳號（Account/Password）→ 家長登入成功
- [x] 10.2 手動測試情境 C：家長自助填寫初次登入 → 進入 `/pending` → 保母產生邀請碼 → 家長輸入 → 搜移轉換 → 跳轉 `/login?activated=1` → 登入成功
- [x] 10.3 手動測試：停用帳號後無法登入，重新啟用後可登入
- [x] 10.4 手動測試：`Parent` 角色無法存取後台路由與 API
- [x] 10.5 驗證底部導覽列在不同角色下的顯示邏輯
- [x] 10.6 驗證 `InviteCode:ExpiryDays` 變更 appsettings 後產生的邀請碼過期時間正確
