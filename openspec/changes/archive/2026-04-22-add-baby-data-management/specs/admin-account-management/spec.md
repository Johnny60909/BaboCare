# admin-account-management Specification (Delta)

## Purpose

為現有的後台帳號管理系統新增寶寶管理功能，擴展後台的功能範圍。

## MODIFIED Requirements

### Requirement: 後台帳號列表

**原始需求** (from existing spec):
系統 SHALL 提供 API `GET /api/admin/users`，回傳所有帳號列表（含已刪除帳號以旗標標示），每筆資料包含：UserID、顯示名稱、角色、啟用狀態、已刪除旗標、目前綁定的登入方式（Google / Line / Email / 手機 / Account）。此 API 需要 `SystemAdmin` 或 `Nanny` 角色。前端以卡片列表形式顯示。

**修改後**:
系統 SHALL 提供 API `GET /api/admin/users`，回傳所有帳號列表（含已刪除帳號以旗標標示），每筆資料包含：UserID、顯示名稱、角色、啟用狀態、已刪除旗標、目前綁定的登入方式（Google / Line / Email / 手機 / Account）。此 API 需要 `SystemAdmin` 或 `Nanny` 角色。前端以卡片列表形式顯示。此外，前端應在後台導航中新增「寶寶管理」功能標籤，允許 `SystemAdmin` 和 `Nanny` 用戶導航至寶寶管理頁面。

#### Scenario: 管理員查看帳號列表

- **GIVEN** 用戶已登入且角色為 `SystemAdmin` 或 `Nanny`
- **WHEN** 用戶進入後台帳號管理頁（`/admin/accounts`）
- **THEN** 頁面顯示所有用戶的表格，欄位包含名稱、角色、狀態、登入方式，且導航欄中包含「寶寶管理」選項

#### Scenario: 無權限用戶無法存取帳號管理 API

- **GIVEN** 用戶已登入但角色為 `Parent`
- **WHEN** 用戶呼叫 `GET /api/admin/users`
- **THEN** 系統回傳 HTTP 403 Forbidden

### Requirement: 後台建立帳號

**原始需求** (from existing spec):
系統 SHALL 提供 API `POST /api/admin/users`，接受欄位：顯示名稱（必填）、性別、Email、手機、Account（帳號名稱）、初始密碼（可選）、角色（`SystemAdmin` / `Nanny` / `Parent`）、啟用狀態。建立時若 Account 未提供，系統 SHALL 自動以 UUID 產生唯一 UserName。

**修改後**:
系統 SHALL 提供 API `POST /api/admin/users`，接受欄位：顯示名稱（必填）、性別、Email、手機、Account（帳號名稱）、初始密碼（可選）、角色（`SystemAdmin` / `Nanny` / `Parent`）、啟用狀態。建立時若 Account 未提供，系統 SHALL 自動以 UUID 產生唯一 UserName。此外，當建立 `Nanny` 角色的帳號時，後台管理員可選擇立即將新帳號分配給寶寶（作為照護保母）。此分配為可選操作，不影響帳號建立流程。

#### Scenario: 成功建立帳號

- **GIVEN** 管理員已登入後台
- **WHEN** 管理員填寫顯示名稱與 Email，提交建立表單
- **THEN** 系統建立帳號並回傳 HTTP 201，帳號出現在列表中

#### Scenario: 建立帳號時 Email 已存在

- **GIVEN** 管理員嘗試建立帳號，輸入已存在的 Email
- **WHEN** 管理員提交建立表單
- **THEN** 系統回傳 HTTP 400，說明 Email 已被使用

#### Scenario: 建立 Nanny 帳號並可選擇分配寶寶

- **GIVEN** 管理員已登入後台，系統中存在未分配的寶寶「baby-001」
- **WHEN** 管理員建立新 `Nanny` 帳號，在可選的「分配寶寶」欄位中選擇「baby-001」
- **THEN** 系統建立帳號並將「baby-001」的照護保母設為新建立的帳號

#### Scenario: Account 未提供時自動產生 UserName

- **GIVEN** 管理員建立帳號時未填寫 Account 欄位
- **WHEN** 系統建立帳號
- **THEN** 系統自動以 UUID 作為 UserName，帳號成功建立

### Requirement: 後台編輯帳號

**原始需求** (from existing spec):
系統 SHALL 提供 API `PUT /api/admin/users/{id}`，可更新顯示名稱、性別、Email、手機、角色、啟用狀態。

**修改後**:
系統 SHALL 提供 API `PUT /api/admin/users/{id}`，可更新顯示名稱、性別、Email、手機、角色、啟用狀態。此外，當帳號角色為 `Nanny` 時，後台管理員可以在編輯頁面中查看和修改該保母負責的寶寶列表。管理員可以添加或移除寶寶的照護保母分配。

#### Scenario: 系統管理員編輯帳號基本資訊

- **GIVEN** 管理員已登入後台
- **WHEN** 管理員編輯帳號，修改顯示名稱和 Email
- **THEN** 系統回傳 HTTP 200，帳號資訊被成功更新

#### Scenario: 編輯 Nanny 帳號時修改負責的寶寶

- **GIVEN** 管理員已登入後台，編輯 ID 為「nanny-001」的保母帳號
- **WHEN** 管理員在編輯頁面中移除「baby-001」的照護保母分配，並新增「baby-002」
- **THEN** 系統回傳 HTTP 200，該保母的負責寶寶列表被更新，「baby-001」的照護保母被清除或重新分配，「baby-002」的照護保母變為該保母

## ADDED Requirements

### Requirement: 後台提供寶寶管理導航

系統 SHALL 在後台管理介面的側邊欄中新增「寶寶管理」導航項目。此項目在用戶角色為 `SystemAdmin` 或 `Nanny` 時可見。點擊該導航項目時，系統 SHALL 導航至寶寶管理頁面（`/admin/babies`）。

#### Scenario: 系統管理員看到寶寶管理導航

- **GIVEN** 系統管理員已登入後台
- **WHEN** 管理員查看後台導航欄
- **THEN** 後台導航欄中顯示「寶寶管理」項目

#### Scenario: 保母看到寶寶管理導航

- **GIVEN** 保母已登入後台
- **WHEN** 保母查看後台導航欄
- **THEN** 後台導航欄中顯示「寶寶管理」項目

#### Scenario: 家長看不到寶寶管理導航

- **GIVEN** 家長已登入系統（注：家長通常不應有後台存取權限，但如果有）
- **WHEN** 家長查看後台（如果可存取）
- **THEN** 後台導航欄中不顯示「寶寶管理」項目
