## ADDED Requirements

### Requirement: 寶寶新增跳頁路由

系統 SHALL 提供獨立的寶寶新增頁面，路由為 `/admin/babies/new`，替代原 Modal 彈窗方式。點擊「新增寶寶」按鈕時導向此頁面。

#### Scenario: 點擊新增按鈕跳轉至新增頁

- **WHEN** 管理員在寶寶管理頁點擊「+ 新增寶寶」按鈕
- **THEN** 系統導向 `/admin/babies/new` 頁面，顯示寶寶新增表單

#### Scenario: 新增成功後返回列表

- **WHEN** 管理員填寫完寶寶表單並成功提交
- **THEN** 系統顯示成功訊息並自動導向 `/admin/babies`

#### Scenario: 點擊取消返回列表

- **WHEN** 管理員在寶寶新增頁點擊「取消」或「返回」
- **THEN** 系統導向 `/admin/babies`，不儲存任何資料

### Requirement: 寶寶新增表單內容

寶寶新增頁 SHALL 包含與寶寶編輯頁相同的欄位：名稱（必填）、性別（必填）、出生日期（必填）、頭像圖片（可選）。表單採白色卡片容器、圓角按鈕樣式。

#### Scenario: 表單必填欄位驗證

- **WHEN** 管理員未填寫名稱即提交表單
- **THEN** 系統在名稱欄位下方顯示「名稱為必填」錯誤提示，不提交 API

#### Scenario: 表單送出呼叫 API

- **WHEN** 管理員填寫所有必填欄位並點擊「儲存」
- **THEN** 系統呼叫 `POST /api/admin/babies`，成功後導向寶寶列表頁
