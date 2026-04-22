## 1. 後端 API 確認與補充

- [x] 1.1 確認 `GET /api/admin/stats`（或等效端點）存在，可回傳 總用戶數與寶寶數；若不存在則新增
- [x] 1.2 確認 `POST /api/admin/babies`（新增寶寶）端點存在；若 不存在則新增
- [x] 1.3 確認以上新增 API 已正確套用 `ResponseBase` 包裝與 `[Authorize(Roles = "SystemAdmin,Nanny")]`

## 2. 共用元件建立

- [x] 2.1 建立 `AdminListHeader` 元件（props: title, searchValue, onSearch, filterButton, addButton）
- [x] 2.2 建立 `AdminPagination` 元件（props: currentPage, totalPages, onPageChange）
- [x] 2.3 建立 `useDebounce` hook（若尚未存在）

## 2. AdminLayout 樣式對齊

- [x] 2.1 確認底部 `glass-nav` 毛玻璃效果樣式正確（backdrop-filter blur、白色半透明背景）
- [x] 2.2 確認 active 狀態為藍色 `#228be6`，非 active 為灰色
- [x] 2.3 確認主內容區底部留有 110px 空間（避免被導航遮蔽）

## 3. AdminDashboardPage 重構

- [x] 3.1 實作兩欄統計指標卡片（總用戶數 + 在托寶寶數），接上真實 API 資料
- [x] 3.2 實作待處理任務區（新帳號審核數量 + 待審核卡片連結）
- [x] 3.3 套用 mantine-card 樣式、`#F8F9FA` 背景色

## 4. AdminUsersPage 重構

- [x] 4.1 移除 Mantine Table，改用卡片列表（使用 `AdminListHeader` 元件）
- [x] 4.2 每張卡片顯示：頭像（首字母 Avatar）、名稱、身分標籤（保母/家長/管理員）、編輯按鈕
- [x] 4.3 接入 `AdminListHeader` 的搜尋框，實作 client-side 搜尋（依名稱過濾）
- [x] 4.4 實作篩選按鈕（依角色：SystemAdmin / Nanny / Parent）
- [x] 4.5 接入 `AdminPagination`，實作 client-side 分頁（每頁 10 筆）
- [x] 4.6 驗證：搜尋後分頁自動重置為第 1 頁

## 5. AdminUserFormPage 樣式統一

- [x] 5.1 表單容器改為白色 mantine-card（32px 圓角、陰影）
- [x] 5.2 提交按鈕改為藍色圓角樣式；取消按鈕改為灰色邊框樣式
- [x] 5.3 頁面頂部加入返回按鈕（← 返回帳號管理）

## 6. AdminBabiesPage 重構

- [x] 6.1 移除 Mantine Table，改用卡片列表
- [x] 6.2 每張卡片顯示：頭像（emoji 或圖片）、名稱、年齡/性別
- [x] 6.3 每張卡片加入保母指派狀態區：有指派顯示保母名稱 + 「變更」按鈕；無指派顯示橘色警告區 + 「立即指派」按鈕（此功能可先顯示樣式，實際指派邏輯待後續）
- [x] 6.4 每張卡片加入操作按鈕：編輯（跳轉至 `/admin/babies/:id`）、刪除（確認彈窗保留）
- [x] 6.5 將「+ 新增寶寶」按鈕改為導向 `/admin/babies/new`（移除原 Modal 邏輯）
- [x] 6.6 接入 `AdminListHeader` 搜尋框（依寶寶名稱過濾）
- [x] 6.7 接入 `AdminPagination`，實作 client-side 分頁（每頁 10 筆）

## 7. AdminBabyNewPage 建立

- [x] 7.1 建立 `AdminBabyNewPage.tsx`（`/admin/babies/new` 路由）
- [x] 7.2 在 `router.tsx` 新增 `/admin/babies/new` 路由（React Router v7 語法；注意放在 `/admin/babies/:id` 前面避免路由衝突）
- [x] 7.3 頁面包含：返回按鈕、頁面標題「新增寶寶」、寶寶表單（重用 BabyForm 元件，或獨立表單）
- [x] 7.4 表單提交成功後導向 `/admin/babies`
- [x] 7.5 套用 mantine-card 容器樣式與圓角按鈕

## 8. AdminBabyEditPage 樣式統一

- [x] 8.1 頁面容器改為白色 mantine-card 樣式
- [x] 8.2 提交/取消按鈕套用設計稿圓角樣式

## 9. AdminPendingPage 重構

- [x] 9.1 卡片樣式對齊設計稿（申請身分藍色/綠色標籤、登入方式 GOOGLE/LINE 標籤）
- [x] 9.2 按鈕文案改為「退回申請」（紅色）和「批准入系統 / 產生邀請碼」（藍色）
- [x] 9.3 確認邀請碼有效性顯示邏輯保留

## 10. 驗證與收尾

- [x] 10.1 確認所有後台路由（`/admin`、`/admin/users`、`/admin/babies`、`/admin/pending`、`/admin/babies/new`）正常運作
- [x] 10.2 確認所有頁面在 `/admin` 路由下均受 `ProtectedRoute` 保護

### Chrome DevTools — 帳號管理

- [x] 10.3 【查詢】Network 確認 `GET /api/admin/users` 回傳 200，列表正確渲染
- [x] 10.4 【搜尋/篩選/分頁】輸入關鍵字後 Network 無多餘請求（client-side），分頁切換正確
- [x] 10.5 【新增】填寫表單送出，Network 確認 `POST /api/admin/users` 回傳 201，導回列表後新帳號出現
- [x] 10.6 【編輯】點擊編輯跳頁，Network 確認 `PUT /api/admin/users/:id` 回傳 200，列表資料更新
- [x] 10.7 【刪除】確認彈窗出現，Network 確認 `DELETE /api/admin/users/:id` 回傳 200，列表移除該項目

### Chrome DevTools — 寶寶管理

- [x] 10.8 【查詢】Network 確認 `GET /api/admin/babies` 回傳 200，卡片列表正確渲染
- [x] 10.9 【搜尋/分頁】client-side 過濾正確，分頁切換無多餘 API 請求
- [x] 10.10 【新增】點擊「+ 新增寶寶」導向 `/admin/babies/new`，填寫送出，Network 確認 `POST /api/admin/babies` 回傳 201，導回列表後新寶寶出現
- [x] 10.11 【編輯】點擊編輯跳頁，Network 確認 `PUT /api/admin/babies/:id` 回傳 200，列表資料更新
- [x] 10.12 【刪除】確認彈窗出現，Network 確認刪除 API 回傳 200，列表移除該項目

### Chrome DevTools — 待審核

- [x] 10.13 【查詢】Network 確認待審核列表 API 回傳 200，卡片正確渲染
- [x] 10.14 【批准】點擊「批准入系統」，Network 確認邀請碼產生 API 回傳 200
- [x] 10.15 【退回】點擊「退回申請」，Network 確認移除 API 回傳 200，該卡片從列表消失

### Chrome DevTools — 管理首頁

- [x] 10.16 【統計指標】Network 確認統計 API 回傳 200，總用戶數與寶寶數正確顯示

### 全局驗收

- [x] 10.17 Console 確認無 React 警告/錯誤（含 key prop、Hook 規則等）
- [x] 10.18 對照 admin-design.html 逐頁視覺驗收（版型、色彩、按鈕樣式）
