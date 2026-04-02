## Context

目前系統使用 OpenIddict Password Grant 完成帳號密碼登入，User 資料儲存於 PostgreSQL，`BaboCare.Identity` 與 `BaboCare.Api` 已分離部署。前端為 React SPA，使用 TanStack Query + Zustand。

現有架構缺少：角色聲明（Role Claim）、帳號停用/刪除旗標、底部導覽列、以及後台管理路由與 API。

## Goals / Non-Goals

**Goals:**

- 在前端新增持久底部導覽列，角色為管理員/保母時顯示後台入口
- 實作後台帳號管理頁面（列表 / 新增 / 編輯 / 刪除 / 停用）
- 擴充 User 資料模型（角色、啟用狀態、姓名、性別、聯絡方式）
- 提供後端帳號管理 REST API（含已啟用帳號列表與待匹配列表）
- 支援家長自行填寫初次登入資料暫存至 PendingUsers（情境 C）
- 透過邀請碼將 PendingUser 正式轉換為已啟用帳號

**Non-Goals:**

- Google / Line OAuth 登入整合（待申請資料完畢後另立 change 實作）
- Google / Line OAuth App 申請與設定
- 多重 OAuth 提供者綁定（依賴 OAuth 整合，一併延後）
- 推播通知功能
- 帳號管理以外的後台模組（寶寶資料等）

## Decisions

### 決策 1：User 資料直接擴充 ASP.NET Core Identity User

**選擇**：繼承/擴充 `IdentityUser`（`ApplicationUser`），在同一張表新增欄位。

**理由**：OpenIddict Password Grant 已綁定 Identity User；分開建表會造成 Join 複雜度與同步問題。

**備選方案**：分離 Profile 表 → 不採用，初期資料量小，分表無益。

---

### 決策 2：ExternalLogin 使用 ASP.NET Identity 內建 `UserLogins` 表（延後實作）

**選擇**：使用 `IdentityUserLogin<string>` 機制儲存 Google/Line 的 `ProviderKey`。

**理由**：Identity Framework 原生支援，不需額外 Migration；`SignInManager.ExternalLoginSignInAsync` 可直接查詢。

> **本 change 暫不實作**：Google/Line OAuth 待第三方應用申請完畢後另立 change 實作。`AspNetUserLogins` 表由 Identity Framework 自動建立，不需在此 Migration 特別處理。

---

### 決策 3：三情境帳號建立流程 + PendingUsers 暫存表

帳號建立與綁定分為三種情境，核心原則為**已正式啟用的帳號只存在於 `ApplicationUser`，未驗證的資料統一暫存於 `PendingUsers` 表**。

#### 情境 A：保母主動出擊（手動建立）

保母在後台帳號管理新增頁直接建立家長帳號（填入 Email / 手機 / Account），系統立即寫入 `ApplicationUser`（`IsActive = true`）並指定 `Parent` 角色，家長可直接用帳號密碼登入。

> **OAuth 自動比對**（延後實作）：待 Google/LINE OAuth 整合完成後，Callback 將比對 Email 自動綁定至既有 `ApplicationUser`。

#### 情境 B：家長主動登入（三方先行）—— **延後實作**

> 依賴 Google/LINE OAuth 整合，本 change 暫不實作。待 OAuth change 完成後，PendingUsers 表的 `Source = Google/Line`、`ProviderKey`、`AvatarUrl` 欄位將用於此情境。

#### 情境 C：家長主動登入（一般帳號自助）

家長在登入頁選擇「初次登入」，填寫基礎資料（名稱、Email / 手機）後暫存至 `PendingUsers`：

1. 填寫完成後顯示「等待授權中」與邀請碼輸入框
2. 保母在後台待匹配列表找到該筆記錄 → 點擊「產生邀請碼」（或「直接指派」）
3. 家長輸入邀請碼 → 執行**搬移轉換**：建立 `ApplicationUser`（含密碼 hash）+ 刪除 `PendingUsers` 記錄 → 完成

#### PendingUsers 表欄位

| 欄位                 | 說明                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `Id`                 | ULID                                                                                     |
| `Source`             | enum：`Google` / `Line` / `Account`（本 change 僅用 `Account`，其餘保留供 OAuth change） |
| `ProviderKey`        | OAuth 提供者 ID（本 change 均為 null）                                                   |
| `Email`              | 登入 Email                                                                               |
| `DisplayName`        | 顯示名稱                                                                                 |
| `AvatarUrl`          | OAuth 頭像（本 change 均為 null）                                                        |
| `PhoneNumber`        | 手機號碼（情境 C）                                                                       |
| `PasswordHash`       | 密碼 Hash（僅情境 C）                                                                    |
| `InviteCode`         | 8 位英數字邀請碼                                                                         |
| `InviteCodeExpiry`   | 過期時間（由 `appsettings` 設定，預設 30 天）                                            |
| `UserName`           | 自填帳號名稱（情境 C，可為 null）                                                        |
| `InviteCodeAttempts` | 嘗試次數（≤ 5）                                                                          |
| `CreatedAt`          | 記錄建立時間                                                                             |

#### 後台待匹配列表操作

- **操作 A「產生邀請碼」**：對 PendingUser 產生 8 位英數字 `InviteCode`，過期天數從 `appsettings` 的 `InviteCode:ExpiryDays` 讀取（預設 30 天）。保母將邀請碼帶外通知家長。
- **操作 B「直接指派」**：（寶寶相關，本次暫不實作）管理員直接對 PendingUser 建立 `ApplicationUser`，跳過邀請碼步驟。

**管理員直接建立員工帳號**：後台保留針對 `SystemAdmin`、`Nanny` 直接建立 Account/Password 帳號的功能，預設 `IsActive = true`，不經過 PendingUsers。

---

### 決策 4：邀請碼驗證與搬移轉換

邀請碼作用於 `PendingUsers` 記錄（非 `ApplicationUser`），驗證通過後執行一次性**搬移轉換**操作。

**搬移轉換邏輯（`POST /api/account/pending/activate`）**：

1. 以 `InviteCode` 查找 `PendingUsers` 記錄
2. 驗證：未過期、嘗試次數 ≤ 5
3. 驗證失敗：`InviteCodeAttempts++`，回傳錯誤
4. 驗證成功：
   - 建立 `ApplicationUser`（`IsActive = true`）
     - `UserName` 優先順序：自填帳號 → Email → 手機號碼 → ULID
   - 指派 `Parent` 角色
   - 轉移密碼 hash（`Source = Account`），直接寫入 `user.PasswordHash`
   - OAuth Source 的 `AddLoginAsync` 綁定步驟延後至 OAuth change 實作
   - 刪除 `PendingUsers` 記錄
   - 回傳 `{ userName }`（不直接發放 Token）
   - 前端收到後跳轉 `/login?activated=1&username=<userName>`，由使用者輸入密碼完成登入

```
[情境 A：保母先建，家長後登入] ← 本 change 實作
Nanny 後台建立 ApplicationUser (Parent, IsActive=true, Account/Password)
  → 家長用帳號密碼登入 → 直接登入
  ↑ OAuth 自動比對綁定延後至 OAuth change 實作

[情境 B：家長 OAuth 先行] ← 延後實作（依賴 OAuth change）
家長 Google/LINE OAuth → Callback 無匹配
  → 建立 PendingUser (Source=Google/Line, ProviderKey, AvatarUrl)
  → 前端顯示「尚未獲得授權」+ 邀請碼輸入框
  → 保母後台待匹配清單 → 產生 InviteCode
  → 家長輸入 InviteCode → POST /api/account/pending/activate
  → 搬移轉換: CreateUser + AddLoginAsync + 刪除 PendingUser → 登入

[情境 C：家長一般帳號自助] ← 本 change 實作
家長登入頁選「初次登入」→ 填基礎資料
  → 建立 PendingUser (Source=Account, PasswordHash)
  → 前端顯示「等待授權中」+ 邀請碼輸入框
  → 保母後台待匹配清單 → 產生 InviteCode
  → 家長輸入 InviteCode → POST /api/account/pending/activate
  → 搬移轉換: CreateUser(含密碼, UserName優先序: 自填帳號→Email→手機→ULID) + 刪除 PendingUser
  → 回傳 { userName } → 前端跳轉 /login?activated=1&username=xxx → 使用者重新登入

[多重 OAuth 提供者] ← 延後實作（依賴 OAuth change）
已啟用帳號登入後 → 帳號設定頁 → 「連結更多登入方式」
  → Google/Line OAuth → AddLoginAsync → 新增一筆 AspNetUserLogins
  → 任一已綁定提供者皆可登入
```

---

### 決策 5：角色聲明（Role Claim）

**選擇**：自訂 `ApplicationRole : IdentityRole<string>`，建構子自動產生 ULID 作為 Id（`varchar(26)`），以 `UserManager.AddToRoleAsync` 管理，OpenIddict 在 Token 中自動包含 `role` Claim。

> **理由**：與 `ApplicationUser.Id` 保持一致，所有主鍵統一使用 ULID，避免混用 GUID/UUID 格式。

前端讀取 JWT payload 的 `role` Claim 判斷是否顯示後台 Icon。

角色清單：`SystemAdmin` / `Nanny` / `Parent`

---

### 決策 6：後台路由保護

前端以 `ProtectedRoute` 元件擴充，加入 `requiredRoles` prop；進入 `/admin/**` 時驗證 Token 中角色，不符合則導向首頁。

---

### 決策 7：帳號管理 API 位置

所有 API 統一放在 `BaboCare.Api`，保持 `BaboCare.Identity` 單純只負責 Token 發放：

| 路由前綴                   | Controller                    | 說明                                                             |
| -------------------------- | ----------------------------- | ---------------------------------------------------------------- |
| `/api/admin/users`         | `AdminUsersController`        | 後台帳號 CRUD，需 `SystemAdmin` 或 `Nanny` 角色                  |
| `/api/admin/pending-users` | `AdminPendingUsersController` | 待匹配列表與邀請碼操作，需 `SystemAdmin` 或 `Nanny` 角色         |
| `/api/account/pending`     | `PendingAccountController`    | 家長自助申請（`/register`）與邀請碼啟用（`/activate`），不需認證 |

## Risks / Trade-offs

| Risk                          | Mitigation                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------- |
| InviteCode 暴力破解           | 設定嘗試次數限制（`InviteCodeAttempts ≤ 5`），過期時間可由 `appsettings` 調整 |
| PendingUsers 記錄持續累積     | 後台提供過濾視圖；定期排程刪除超過 90 天未完成的 PendingUser                  |
| ApplicationUser UserName 衝突 | UserName 固定使用 UUID（由搬移轉換產生），不對外顯示                          |
| Identity 表欄位過多           | 初期可接受；後續若需效能優化再分 Profile 表                                   |
| Google/Line OAuth（延後）     | 本 change 不涉及，待 OAuth change 時才需處理 HTTPS Callback 與重複觸發問題    |

## Migration Plan

1. 新增 `ApplicationUser` 欄位 + 建立 `PendingUsers` 表，產生 EF Core Migration
2. 部署 `BaboCare.Identity` 更新（`DbSeeder` 種入角色與初始帳號；OAuth handler 延後）
3. 部署 `BaboCare.Api` 更新（帳號管理 API + 待匹配列表 API + 家長自助申請/啟用 API）
4. 部署前端更新（Bottom Nav + 後台帳號管理頁 + 待匹配列表頁 + 情境 C 初次登入頁）
5. 建立初始角色種子資料（`SystemAdmin`、`Nanny`、`Parent`）

**回滾**：EF Core `database update <previous-migration>`，前端 revert PR，兩者獨立可回滾。

## Open Questions

- Google/Line OAuth App 申請完畢後，需另立 change 補完情境 A（Callback 自動比對）與情境 B（OAuth 先行 PendingUser）。
- `InviteCode:ExpiryDays` 預設值設為 30 天，appsettings 範例：
  ```json
  "InviteCode": {
    "ExpiryDays": 30
  }
  ```
