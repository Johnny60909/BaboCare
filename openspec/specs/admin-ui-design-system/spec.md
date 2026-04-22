## ADDED Requirements

### Requirement: 後台統一設計語言 — 卡片元件

後台所有列表項目 SHALL 使用統一的 `mantine-card` 卡片樣式：白色背景、`border-radius: 32px`、`border: 1px solid #E9ECEF`、`box-shadow: 0 4px 12px rgba(0,0,0,0.05)`。

#### Scenario: 帳號管理頁顯示卡片樣式

- **WHEN** 管理員進入帳號管理頁 `/admin/users`
- **THEN** 每個帳號以卡片形式呈現，含頭像、名稱、身分標籤、編輯按鈕

#### Scenario: 寶寶管理頁顯示卡片樣式

- **WHEN** 管理員進入寶寶管理頁 `/admin/babies`
- **THEN** 每個寶寶以卡片形式呈現，含頭像、名稱、年齡/性別、保母指派狀態區

### Requirement: 後台統一設計語言 — 底部 glass-nav 導航

後台 AdminLayout 的底部導航 SHALL 使用毛玻璃效果（`backdrop-filter: blur(16px)`），包含：管理首頁、帳號管理、寶寶管理、待審核、返回 共 5 個項目。

#### Scenario: 導航顯示 active 高亮狀態

- **WHEN** 管理員位於帳號管理頁
- **THEN** 底部導航「帳號管理」項目顯示藍色高亮（`#228be6`），其他項目為灰色

#### Scenario: 導航點擊跳轉正確頁面

- **WHEN** 管理員點擊導航中的「寶寶管理」
- **THEN** 系統導向 `/admin/babies`

### Requirement: 後台統一設計語言 — 按鈕樣式規範

後台所有主要操作按鈕 SHALL 使用藍色填色樣式（`background: #228be6`）搭配 `border-radius: 32px`；危險操作（刪除/退回）使用紅色；次要操作（篩選/取消）使用灰色邊框樣式。

#### Scenario: 新增按鈕顯示正確樣式

- **WHEN** 管理員在帳號管理頁查看標題區
- **THEN** 「+ 新增帳號」按鈕顯示藍色背景、圓角、白色文字

#### Scenario: 退回按鈕顯示紅色

- **WHEN** 管理員在待審核頁查看審核卡片
- **THEN** 「退回申請」按鈕顯示紅色背景

### Requirement: 後台統一設計語言 — 頁面背景色

後台所有頁面背景色 SHALL 為 `#F8F9FA`，主內容區頂部保留空間供標題顯示，底部保留 `110px` 空間避免被導航遮蔽。

#### Scenario: 頁面背景正確顯示

- **WHEN** 管理員進入任何後台頁面
- **THEN** 頁面背景色為 `#F8F9FA`，內容不被底部導航遮蔽
