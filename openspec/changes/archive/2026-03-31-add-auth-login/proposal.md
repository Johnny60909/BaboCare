## Why

保母托育紀錄系統需要身份驗證機制，確保只有合法的保母用戶才能存取系統並管理托育紀錄。在建立任何核心功能之前，必須先建立安全的登入基礎。

## What Changes

- 新增用戶登入頁面（帳號 + 密碼）
- 新增 JWT Token 驗證機制（透過 OpenIddict Password Flow）
- 新增後端身份驗證 API 端點
- 首頁（Dashboard）保留為空白頁，需登入後才可進入
- 未登入時自動導向登入頁面

## Capabilities

### New Capabilities

- `user-auth`: 用戶登入與身份驗證，包含帳號密碼驗證、Token 發放、受保護路由守衛

### Modified Capabilities

<!-- 目前無既有 spec，此為全新系統第一個功能 -->

## Impact

- **後端**: 新增 OpenIddict 設定、Identity 資料表（Users）、/connect/token 端點
- **前端**: 新增登入頁面路由（`/login`）、受保護路由（`/`）、Token 儲存於 localStorage
- **資料庫**: 新增 ASP.NET Identity + OpenIddict 所需資料表
- **相依套件**: Microsoft.AspNetCore.Identity、OpenIddict、OpenIddict.AspNetCore、OpenIddict.EntityFrameworkCore

## Rollback Plan

- 若身份驗證功能發生問題，可臨時關閉路由守衛（移除 `<ProtectedRoute>`），使首頁可直接存取
- 後端可透過停用 OpenIddict 中介軟體回退至無驗證狀態
- 資料庫 migration 可透過 `dotnet ef database update <前版本>` 回退

## Affected Teams

- **後端開發**: 負責 Identity + OpenIddict 設定、API 端點
- **前端開發**: 負責登入 UI、路由守衛、Token 管理
