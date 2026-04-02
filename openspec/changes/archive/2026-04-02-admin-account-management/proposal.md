## Why

目前系統僅支援帳號密碼登入，且缺乏後台管理入口與帳號管理功能，無法讓系統管理員預先建立家長帳號、管理角色與狀態，也無法支援第三方登入（Google/Line）與既有帳號的綁定流程。現階段需要先建立後台帳號管理基礎，讓保母/管理員能完整管理所有帳號。

## What Changes

- 新增前端底部導覽列（Bottom Navigation），已登入後顯示；若角色為系統管理員或保母，額外顯示「後台管理」入口 Icon
- 新增後台帳號管理頁面：列表、新增、編輯、停用/啟用、刪除
- 擴充帳號資料模型：新增姓名、性別、聯絡資料、角色、啟用狀態、刪除標記欄位
- 新增後端帳號管理 API（CRUD + 狀態變更）
- 家長自行填寫初次登入資料，暫存至 PendingUsers（情境 C）
- 透過邀請碼將 PendingUser 正式轉換為已啟用帳號，完成後跳轉登入頁

## Capabilities

### New Capabilities

- `bottom-navigation`: 前端底部導覽列，登入後可見；角色為管理員或保母時顯示後台入口
- `admin-account-management`: 後台帳號管理頁面與對應後端 API（列表、新增、編輯、停停用用、刪除）
- `account-binding`: 家長自助帳號申請（情境 C）、後台邀請碼產生與啟用流程

### Modified Capabilities

- `user-auth`: 擴充 Identity 服務以支援第三方登入（Google/Line OAuth）及 Refresh Token 綁定既有帳號的流程；新增角色聲明（Claim）至 Token，使前端可判斷角色顯示後台入口

## Impact

- **後端**：`BaboCare.Identity`（OpenIddict）新增 Role Claim、停用/刪除帳號欋阶；`BaboCare.Api` 新增帳號管理 endpoints 與家長自助申請/啟用 endpoints；`BaboCare.Infrastructure` 擴充 User entity 欄位與 Migration
- **前端**：新增 Bottom Navigation 元件、後台路由保護（需管理員或保母角色）、帳號管理頁面、家長自助申請頁面
- **資料庫**：User table 新增欄位（DisplayName、Gender、IsActive、IsDeleted）；新增 `PendingUsers` 表；`AspNetRoles.Id` 營改為 ULID 格式
- **影響團隊**：全端開發
- **回滚方案**：資料庫 Migration 可 Down 回滚；前端路由與元件可獨立 revert
