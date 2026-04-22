## Context

後台管理介面目前各頁面 UI 風格不一致，AdminBabiesPage 使用 Mantine Table，AdminUsersPage 沒有搜尋/分頁，AdminBabiesPage 新增使用 Modal 彈窗。設計稿（admin-design.html）已定義完整的後台視覺語言：毛玻璃底部導航、mantine-card 卡片列表、分頁器、以及跳頁式表單。所有後台頁面須全面套用此設計稿，達成 UI 一致性與功能完整性。

技術棧：React + Mantine v8 + Tailwind CSS + React Router v7 + TanStack Query

## Goals / Non-Goals

**Goals:**

- 全部後台頁面（AdminLayout、Dashboard、Users、Babies、Pending）套用設計稿 UI 風格
- AdminUsersPage 新增搜尋、篩選、分頁功能
- AdminBabiesPage 從 Mantine Table 改為卡片式列表，新增搜尋與分頁
- AdminBabiesPage 新增功能從 Modal 彈窗改為跳頁（新路由 `/admin/babies/new`）
- AdminPendingPage 按鈕文案對齊設計稿（「退回申請」/「批准入系統」）
- 統一所有表單頁的視覺樣式（卡片容器、圓角按鈕）

**Non-Goals:**

- 新增統計圖表（折線圖、柱狀圖）
- 深色模式適配
- 移動端響應式優化（非此次主要目標）

## Decisions

### D1：列表分頁策略 — Client-Side Pagination

**決策**: 採用前端 client-side 分頁，一次取回全部資料後在前端分割。

**理由**:

- 後台用戶數量通常有限（數百至數千），client-side 分頁足夠
- 搜尋/篩選同樣在前端 derived state 處理，邏輯集中、簡單

**替代方案**: Server-side pagination — 可行，但工作量較大，此次非必要。

---

### D2：寶寶新增頁 — 跳頁取代 Modal

**決策**: AdminBabiesPage 的新增寶寶按鈕改為導向 `/admin/babies/new`（跳頁），不再使用 Modal。

**理由**:

- 設計稿所有新增/編輯均為跳頁方式，保持一致性
- 跳頁表單可支援更多欄位，不受 Modal 視窗高度限制
- 符合用戶需求明確要求（新增與編輯頁，以跳頁為主，不要彈窗）

**替代方案**: 保留 Modal — 不符合設計稿，且與用戶需求衝突。

---

### D3：寶寶列表樣式 — 卡片取代 Table

**決策**: AdminBabiesPage 從 Mantine `<Table>` 元件改為卡片式列表（與設計稿 page-admin-babies 一致）。

**理由**:

- 設計稿採用卡片式（含頭像、保母指派狀態、警告區塊）
- 卡片式更易於展示複合資訊（保母指派狀態、操作按鈕群組）
- 與 AdminUsersPage 的卡片風格統一

---

### D4：共用 AdminListLayout 元件

**決策**: 抽取 `AdminListHeader`（標題 + 搜尋框 + 篩選按鈕 + 新增按鈕）與 `AdminPagination`（分頁器）為共用元件，供 UsersPage 與 BabiesPage 複用。

**理由**:

- 避免重複的搜尋/分頁邏輯
- 未來新增其他列表頁時可直接複用

---

### D5：搜尋使用 debounce

**決策**: 搜尋輸入框使用 300ms debounce，避免每次按鍵都觸發過濾。

**理由**: 提升效能，減少不必要的重渲染。

---

### D6：前端功能需求變動須連帶調整後端 API

**決策**: 前端頁面若因功能調整（如新增寶寶新增跳頁、Dashboard 統計指標顯示等）導致現有後端 API 欄位不足或缺少端點，須同步修改後端 API，確保全棧一致性。

**理由**:

- 前後端作為一個整體，UI 功能變動不應因後端 API 不符合而被迫 workaround
- AdminDashboardPage 需要總用戶數與寶寶數的統計端點（若不存在須新增）
- AdminBabyNewPage 需要 `POST /api/admin/babies` 端點支援

**替代方案**: 前端硬編假資料 — 不可接受，會造成功能缺失。

## Risks / Trade-offs

- [Risk] Client-side 分頁在資料量非常大時（> 1萬筆）效能會下降 → **Mitigation**: 後台資料量預期有限，若未來需要可無縫切換為 server-side pagination
- [Risk] AdminBabiesPage 改動較大（Table → Cards），可能遺漏既有功能（刪除確認等） → **Mitigation**: 逐一核對現有功能清單，確保刪除確認彈窗保留
- [Risk] BabyForm 元件同時被用戶端使用（非 admin 頁面），需確認改動不影響其他使用場景 → **Mitigation**: admin 頁面使用獨立的 AdminBabyFormPage，不修改 BabyForm.tsx 本身

## Migration Plan

1. **確認後端 API 是否齊備**：核查 `GET /api/admin/stats`（或等效端點）、`POST /api/admin/babies` 是否存在，缺少者須先補充後端實作
2. 先建立前端共用元件（AdminListHeader, AdminPagination）
3. 逐頁改造（順序：Layout → Dashboard → Users → Babies → Pending → Form 頁面）
4. 新增 `/admin/babies/new` 路由與 `AdminBabyNewPage`
5. 回歸測試：確認所有後台路由正常，原有功能（編輯/刪除/審核）仍可用
6. Rollback: git revert 相關 commit 即可恢復；後端新增 API 為純新增，不影響現有端點

## Open Questions

- AdminPendingPage 的「批准入系統」目前是透過邀請碼流程，是否同步修改邏輯？（本次以 UI 為主，邏輯沿用現有）
- 是否需要為 AdminDashboardPage 補充實際 API 資料取得（總用戶數、寶寶數）？（建議同步補充）
