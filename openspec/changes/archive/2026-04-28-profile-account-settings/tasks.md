# 個人中心帳戶設定 - Tasks

## 後端開發

- [x] 新增 UpdateMyProfileRequest DTO
- [x] 新增 ICurrentUserService 接口和實現
- [x] 新增 PUT /api/me/profile 端點
- [x] 新增驗證規則（displayName, email, phoneNumber）

## 前端 - Service 層

- [x] 新增 CurrentUserDto (Frontend)
- [x] 新增 UpdateMyProfileRequest (Frontend)
- [x] 新增 CurrentUserService (API 調用)

## 前端 - Hook 層

- [x] 新增 useCurrentUser Hook (查詢當前用戶信息)
- [x] 新增 useUpdateMyProfile Hook (更新當前用戶)

## 前端 - UI 層

- [x] 新增 AccountSettingsForm 組件 (編輯表單)
- [x] 修改 ProfilePage 支持顯示/編輯模式
- [x] 修改 ProfileSettingsMenu 新增帳戶設定、後台入口選項
- [x] 修改 BottomNavigation 移除「管理」按鈕

## 測試

- [x] 後端：PUT /api/users/me 端點單元測試
- [x] 前端：AccountSettingsForm 組件單元測試
- [x] 集成測試：用戶更新資訊的完整流程
