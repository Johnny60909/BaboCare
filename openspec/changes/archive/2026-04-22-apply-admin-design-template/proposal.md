## Why

目前後台管理介面的各頁面 UI 風格不統一，且缺乏搜尋、篩選、分頁等基本功能，嚴重影響管理效率。現已有完整的設計稿（admin-design.html），以 Mantine + Tailwind 風格建立了統一的後台視覺語言，應將全部後台頁面統一套用此設計稿。

## What Changes

- **AdminLayout** — 確保底部 glass-nav 導航樣式與設計稿一致（Icon + 文字、active 高亮）
- **AdminDashboardPage** — 統計卡片（總用戶數/寶寶數）+ 待處理任務區，採用設計稿的兩欄指標卡片版型
- **AdminUsersPage** — 重構為卡片清單，新增搜尋框、篩選按鈕與分頁器；移除 Mantine Table
- **AdminUserFormPage** — 樣式統一至設計稿風格（白色卡片容器、32px 圓角按鈕）；保持跳頁方式
- **AdminBabiesPage** — 從 Mantine Table 重構為卡片式列表，加入保母指派狀態顯示、搜尋與分頁
- **AdminBabyEditPage / AdminBabyNewPage** — 以跳頁方式呈現（原本新增是 Modal），統一為跳頁表單；樣式套用設計稿風格
- **AdminPendingPage** — 按鈕文案對齊設計稿（「退回申請」紅色 + 「批准入系統」藍色）；卡片樣式對齊設計稿

**BREAKING**: AdminBabiesPage 新增寶寶由 Modal 彈窗改為跳頁，路由新增 `/admin/babies/new`

## Capabilities

### New Capabilities

- `admin-ui-design-system`: 後台統一設計語言，包含 mantine-card、glass-nav、色彩系統、按鈕樣式的標準化規範
- `admin-list-pagination`: 後台列表頁面的搜尋、篩選與分頁功能（帳號管理與寶寶管理共用）
- `admin-baby-new-page`: 獨立的寶寶新增跳頁（取代原 Modal 彈窗方式）

### Modified Capabilities

- `admin-account-management`: 帳號管理列表加入搜尋/篩選/分頁；編輯/新增表單套用新設計稿樣式

## Impact

- **前端頁面**: `AdminLayout.tsx`、`AdminDashboardPage.tsx`、`AdminUsersPage.tsx`、`AdminUserFormPage.tsx`、`AdminBabiesPage.tsx`、`AdminBabyEditPage.tsx`、`AdminPendingPage.tsx`
- **元件**: `BabyForm.tsx`（從 Modal 模式變為跳頁模式）
- **路由**: `router.tsx` 新增 `/admin/babies/new` 路由
- **API（可能）**: 若後端列表 API 尚未支援分頁參數（page/pageSize/search），需同步新增
- **Rollback**: 所有前端變更均在 React 元件層，可透過 git revert 恢復；後端 API 擴充為可選參數，向下相容
- **Affected Teams**: 前端（主要）、後端（列表 API 分頁擴充）
