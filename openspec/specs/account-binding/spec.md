# account-binding Specification

## Purpose
TBD - synced from change 2026-04-02-admin-account-management. Update Purpose after review.

## ADDED Requirements

### Requirement: 管理員建立佔位帳號並產生邀請碼

系統 SHALL 在建立帳號時自動產生一組 8 位英數字邀請碼（`InviteCode`），並記錄有效期限（30 天）。管理員可在後台帳號列表查看邀請碼並複製提供給家長。

#### Scenario: 建立帳號時自動產生邀請碼

- **GIVEN** 管理員建立一個新的佔位帳號
- **WHEN** API 成功建立帳號
- **THEN** 系統自動產生 `InviteCode` 並儲存，帳號建立回應包含 `inviteCode` 欄位

#### Scenario: 管理員查看帳號邀請碼

- **GIVEN** 管理員在後台帳號列表
- **WHEN** 管理員點擊未綁定帳號的「查看邀請碼」
- **THEN** 顯示邀請碼及其有效期限

### Requirement: 第三方登入後自動比對並綁定帳號

系統 SHALL 在用戶使用 Google 或 Line OAuth 完成登入後，取得第三方 Email，若與現有佔位帳號 Email 一致，系統 SHALL 自動呼叫 `AddLoginAsync` 綁定，並將帳號狀態設為啟用（`IsActive=true`）。

#### Scenario: Google 登入 Email 與佔位帳號一致時自動綁定

- **GIVEN** 管理員已建立以 `parent@example.com` 為 Email 的佔位帳號
- **WHEN** 家長使用 Google OAuth（Email 為 `parent@example.com`）登入
- **THEN** 系統自動將 Google 登入方式綁定至既有帳號，帳號啟用，家長完成登入

#### Scenario: Google 登入 Email 無匹配時導向邀請碼頁面

- **GIVEN** 家長使用 Google OAuth 登入，但 Google Email 與任何佔位帳號 Email 不符
- **WHEN** OAuth Callback 執行比對
- **THEN** 系統建立暫時 Session，並導向邀請碼輸入頁面（而非直接建立新帳號）

### Requirement: 家長輸入邀請碼完成手動綁定

系統 SHALL 提供 API `POST /api/account/bind-invite`，接受當前 Session 的第三方 ID 與用戶輸入的 `inviteCode`，驗證碼有效後將第三方登入方式綁定至對應帳號並啟用。每個邀請碼最多可嘗試 5 次，超過後失效。

#### Scenario: 邀請碼正確時綁定成功

- **GIVEN** 家長已完成 Google OAuth 且在邀請碼輸入頁面
- **WHEN** 家長輸入正確的邀請碼並提交
- **THEN** 系統綁定 Google 登入方式至對應帳號，帳號啟用，家長導向首頁

#### Scenario: 邀請碼錯誤

- **GIVEN** 家長在邀請碼輸入頁面
- **WHEN** 家長輸入錯誤的邀請碼
- **THEN** 系統回傳錯誤訊息，並記錄失敗次數

#### Scenario: 邀請碼嘗試超過 5 次後失效

- **GIVEN** 家長已嘗試輸入錯誤邀請碼 5 次
- **WHEN** 家長再次嘗試任意邀請碼
- **THEN** 系統回傳邀請碼已失效訊息，需要管理員重新產生

#### Scenario: 邀請碼過期

- **GIVEN** 邀請碼建立已超過 30 天
- **WHEN** 家長嘗試使用該邀請碼
- **THEN** 系統回傳邀請碼已過期訊息

### Requirement: 管理員手動確認綁定

系統 SHALL 提供後台「待綁定帳號」清單，顯示已完成第三方 OAuth 但尚未綁定至現有帳號的 Session。管理員可點擊「確認綁定」，選擇對應帳號完成綁定並啟用。

#### Scenario: 管理員手動確認綁定

- **GIVEN** 有一個等待綁定的第三方登入 Session
- **WHEN** 管理員在後台點擊「確認綁定」並選擇對應帳號
- **THEN** 系統將第三方登入方式綁定至所選帳號，帳號啟用，Session 從待綁定清單移除

### Requirement: 管理員可重新產生邀請碼

系統 SHALL 提供 API `POST /api/admin/users/{id}/regenerate-invite`，產生新的 8 位邀請碼並重設有效期限，舊邀請碼立即失效。

#### Scenario: 重新產生邀請碼

- **GIVEN** 管理員在後台操作一個帳號
- **WHEN** 管理員點擊「重新產生邀請碼」
- **THEN** 系統產生新邀請碼，舊邀請碼失效，回傳新邀請碼內容
