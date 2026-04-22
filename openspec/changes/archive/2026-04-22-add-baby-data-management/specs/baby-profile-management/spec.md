# baby-profile-management Specification

## Purpose

提供寶寶資料的完整生命週期管理功能，包括建立、編輯、查看和刪除寶寶資訊。此功能允許不同角色（系統管理員、保母、家長）根據他們的權限來管理寶寶資料。

## ADDED Requirements

### Requirement: 系統提供寶寶資料的檢視端點

系統 SHALL 提供 API `GET /api/babies`，根據登入用戶的角色回傳相應的寶寶列表。系統管理員可查看全部寶寶，保母只能查看他負責的寶寶，家長只能查看自己的寶寶。每筆寶寶資料包含：寶寶ID、名稱、出生日期、性別、照護保母的名稱、綁定家長列表。此 API 需要有效的 Bearer Token。

#### Scenario: 系統管理員查看所有寶寶

- **GIVEN** 用戶已登入且角色為 `SystemAdmin`
- **WHEN** 用戶呼叫 `GET /api/babies`
- **THEN** 系統回傳 HTTP 200，包含系統中所有寶寶的列表

#### Scenario: 保母查看自己負責的寶寶

- **GIVEN** 用戶已登入且角色為 `Nanny`，負責照顧ID為「baby-001」和「baby-002」的寶寶
- **WHEN** 用戶呼叫 `GET /api/babies`
- **THEN** 系統回傳 HTTP 200，只包含該保母負責的寶寶

#### Scenario: 家長查看自己的寶寶

- **GIVEN** 用戶已登入且角色為 `Parent`，綁定到「baby-001」
- **WHEN** 用戶呼叫 `GET /api/babies`
- **THEN** 系統回傳 HTTP 200，只包含該家長綁定的寶寶

#### Scenario: 未登入用戶無法存取

- **GIVEN** 用戶未登入（無 Token）
- **WHEN** 用戶呼叫 `GET /api/babies`
- **THEN** 系統回傳 HTTP 401 Unauthorized

### Requirement: 系統提供取得單個寶寶詳細資訊的端點

系統 SHALL 提供 API `GET /api/babies/{id}`，回傳指定寶寶的詳細資訊，包含：寶寶ID、名稱、出生日期、性別、照護保母的完整信息、綁定的所有家長的完整信息、以及審計欄位（CreatedAt、CreatedBy、UpdatedAt、UpdatedBy）。如果用戶無權訪問該寶寶，系統 SHALL 回傳 HTTP 403 Forbidden。

#### Scenario: 授權用戶檢視寶寶詳細資訊

- **GIVEN** 用戶已登入且有權訪問「baby-001」
- **WHEN** 用戶呼叫 `GET /api/babies/baby-001`
- **THEN** 系統回傳 HTTP 200，包含該寶寶的完整詳細資訊

#### Scenario: 未授權用戶無法檢視

- **GIVEN** 用戶已登入但無權訪問「baby-999」
- **WHEN** 用戶呼叫 `GET /api/babies/baby-999`
- **THEN** 系統回傳 HTTP 403 Forbidden

### Requirement: 系統提供建立新寶寶的端點

系統 SHALL 提供 API `POST /api/babies`，接受以下欄位：名稱（必填、非空）、出生日期（必填、有效日期）、性別（必填、值為 "Male" / "Female" / "Other"）、照護保母ID（可選）、家長ID列表（可選）、頭像圖檔（可選，支持 JPG/PNG/GIF，限制 5MB）。系統 SHALL 驗證照護保母和家長ID的存在性。建立成功時，系統 SHALL 自動設置 CreatedAt 和 CreatedBy 審計欄位。此 API 需要 `SystemAdmin` 或 `Nanny` 角色。

#### Scenario: 系統管理員成功建立寶寶

- **GIVEN** 系統管理員已登入，存在照護保母 ID「nanny-001」
- **WHEN** 管理員提交建立寶寶的請求，包含名稱「小明」、出生日期「2023-06-15」、性別「Male」、保母ID「nanny-001」
- **THEN** 系統回傳 HTTP 201，寶寶被成功建立，並返回新建立的寶寶對象，包含生成的寶寶ID

#### Scenario: 保母建立新寶寶時自動分配給自己

- **GIVEN** 保母用戶已登入，用戶ID為「nanny-002」
- **WHEN** 保母提交建立寶寶的請求，系統應自動將 `照護保母ID` 設為「nanny-002」
- **THEN** 系統回傳 HTTP 201，寶寶被成功建立，並將該保母設為照護者

#### Scenario: 家長無法建立寶寶

- **GIVEN** 家長用戶已登入
- **WHEN** 家長嘗試呼叫 `POST /api/babies`
- **THEN** 系統回傳 HTTP 403 Forbidden

#### Scenario: 必填欄位缺失

- **GIVEN** 用戶已登入且具有建立權限
- **WHEN** 用戶提交建立寶寶的請求，遺漏了必填欄位「名稱」
- **THEN** 系統回傳 HTTP 400，包含驗證錯誤信息

#### Scenario: 照護保母ID不存在

- **GIVEN** 用戶已登入且具有建立權限
- **WHEN** 用戶提交建立寶寶的請求，指定的保母ID「nanny-999」不存在
- **THEN** 系統回傳 HTTP 400，說明保母不存在

#### Scenario: 建立寶寶時保母ID為空值

- **GIVEN** 用戶已登入且具有建立權限、頭像圖檔
- **WHEN** 用戶提交建立寶寶的請求，未指定照護保母ID（允許空值）
- **THEN** 系統回傳 HTTP 201，寶寶被成功建立，NannyId 為 null

### Requirement: 系統提供編輯寶寶的端點

系統 SHALL 提供 API `PUT /api/babies/{id}`，允許編輯現有寶寶的資訊。可編輯的欄位包括：名稱、出生日期、性別、照護保母ID、家長ID列表。只有擁有編輯權限的用戶（系統管理員或該寶寶的照護保母）可以執行此操作。編輯成功時，系統 SHALL 自動更新 UpdatedAt 和 UpdatedBy 審計欄位。

#### Scenario: 系統管理員編輯寶寶資訊

- **GIVEN** 系統管理員已登入
- **WHEN** 管理員提交編輯寶寶「baby-001」的請求，修改名稱為「小王」
- **THEN** 系統回傳 HTTP 200，寶寶資訊被成功更新，包含新的 UpdatedAt 和 UpdatedBy

#### Scenario: 照護保母編輯自己負責的寶寶

- **GIVEN** 保母用戶已登入，負責照顧「baby-001」
- **WHEN** 保母提交編輯「baby-001」的請求
- **THEN** 系統回傳 HTTP 200，寶寶資訊被成功更新

#### Scenario: 照護保母無法編輯不是自己負責的寶寶

- **GIVEN** 保母用戶已登入，不負責「baby-999」
- **WHEN** 保母嘗試編輯「baby-999」
- **THEN** 系統回傳 HTTP 403 Forbidden

#### Scenario: 編輯寶寶時清除保母分配

- **GIVEN** 寶寶「baby-001」目前的照護保母為「nanny-001」
- **WHEN** 管理員提交編輯請求，將照護保母ID設為 null
- **THEN** 系統回傳 HTTP 200，該寶寶的 NannyId 被更新為 null

#### Scenario: 家長無法編輯寶寶

- **GIVEN** 家長用戶已登入
- **WHEN** 家長嘗試編輯任何寶寶
- **THEN** 系統回傳 HTTP 403 Forbidden

### Requirement: 系統提供寶寶編輯頁面中的保母智能預帶功能

當編輯寶寶時，系統 SHALL 檢查系統中的保母數量。如果只有1位保母或1位系統管理員可作為照護者，前端 SHALL 自動預帶該用戶為選定的保母，無需用戶手動選擇。

#### Scenario: 系統中只有1位保母時自動預帶

- **GIVEN** 系統中只有1位保母用戶（ID「nanny-only」）
- **WHEN** 用戶打開編輯寶寶頁面的照護保母選擇欄位
- **THEN** 「nanny-only」自動被預選為預設值

#### Scenario: 系統中有多位保母時不預帶

- **GIVEN** 系統中有多位保母用戶（「nanny-001」、「nanny-002」等）
- **WHEN** 用戶打開編輯寶寶頁面的照護保母選擇欄位
- **THEN** 不進行任何預帶，用戶需要手動選擇

### Requirement: 系統提供寶寶詳細資訊頁面的首頁故事列展示

系統 SHALL 在首頁顯示「故事列」，根據登入用戶的角色展示相應的寶寶頭像。系統管理員看到全部寶寶，保母看到自己負責的寶寶，家長看到自己的寶寶。點擊頭像時，系統 SHALL 導航至該寶寶的詳細資訊頁面。

#### Scenario: 系統管理員首頁看到所有寶寶

- **GIVEN** 系統管理員已登入，系統中有 5 個寶寶
- **WHEN** 管理員進入首頁
- **THEN** 首頁的故事列顯示所有 5 個寶寶的頭像

#### Scenario: 保母首頁看到自己負責的寶寶

- **GIVEN** 保母用戶已登入，負責照顧 2 個寶寶
- **WHEN** 保母進入首頁
- **THEN** 首頁的故事列只顯示該保母負責的 2 個寶寶的頭像

#### Scenario: 家長首頁看到自己的寶寶

- **GIVEN** 家長用戶已登入，綁定 1 個寶寶
- **WHEN** 家長進入首頁
- **THEN** 首頁的故事列只顯示該家長綁定的寶寶頭像

### Requirement: 系統提供寶寶頭像的默認值

當寶寶沒有上傳頭像時，系統 SHALL 顯示一個根據寶寶性別生成的默認頭像。男性寶寶使用藍色默認頭像，女性寶寶使用粉色默認頭像，未知性別使用灰色默認頭像。

#### Scenario: 男性寶寶顯示藍色默認頭像

- **GIVEN** 寶寶的性別為「Male」且未上傳頭像
- **WHEN** 系統在首頁故事列中顯示該寶寶
- **THEN** 系統顯示藍色默認頭像

#### Scenario: 女性寶寶顯示粉色默認頭像

- **GIVEN** 寶寶的性別為「Female」且未上傳頭像
- **WHEN** 系統在首頁故事列中顯示該寶寶
- **THEN** 系統顯示粉色默認頭像

### Requirement: 系統提供寶寶頭像上傳端點

系統 SHALL 提供 API `POST /api/babies/{id}/avatar`，允許授權用戶上傳寶寶頭像圖檔。支持格式為 JPG、PNG、GIF，限制大小為 5MB。上傳成功時，系統 SHALL 將圖檔存儲在伺服器上，並在寶寶資料中記錄頭像 URL。只有系統管理員和負責該寶寶的保母可以上傳或修改頭像。

#### Scenario: 系統管理員成功上傳寶寶頭像

- **GIVEN** 系統管理員已登入，寶寶「baby-001」存在
- **WHEN** 管理員提交 POST 請求至 `/api/babies/baby-001/avatar`，上傳有效的 JPG 圖檔（2MB）
- **THEN** 系統回傳 HTTP 200，寶寶的 AvatarUrl 被更新為新的圖檔 URL

#### Scenario: 保母上傳自己負責寶寶的頭像

- **GIVEN** 保母用戶已登入，負責照顧「baby-001」
- **WHEN** 保母提交上傳頭像的請求，上傳 PNG 圖檔
- **THEN** 系統回傳 HTTP 200，頭像被成功上傳

#### Scenario: 保母無法上傳不是自己負責的寶寶的頭像

- **GIVEN** 保母用戶已登入，不負責「baby-999」
- **WHEN** 保母嘗試上傳「baby-999」的頭像
- **THEN** 系統回傳 HTTP 403 Forbidden

#### Scenario: 家長無法上傳寶寶頭像

- **GIVEN** 家長用戶已登入，綁定「baby-001」
- **WHEN** 家長嘗試上傳頭像
- **THEN** 系統回傳 HTTP 403 Forbidden

#### Scenario: 上傳文件格式不支持

- **GIVEN** 用戶已登入且具有上傳權限
- **WHEN** 用戶嘗試上傳 PDF 或其他不支持的格式
- **THEN** 系統回傳 HTTP 400，說明文件格式不支持

#### Scenario: 上傳文件大小超過限制

- **GIVEN** 用戶已登入且具有上傳權限
- **WHEN** 用戶嘗試上傳大小超過 5MB 的圖檔
- **THEN** 系統回傳 HTTP 413，說明文件大小超過限制

### Requirement: 系統在寶寶列表中包含頭像信息

系統 SHALL 在 `GET /api/babies` 和 `GET /api/babies/{id}` 的回應中包含寶寶的頭像 URL（`AvatarUrl` 欄位）。若寶寶無上傳的頭像，系統 SHALL 在回應中指示使用默認頭像（如返回 null 或特定的默認值）。

#### Scenario: API 回應包含頭像 URL

- **GIVEN** 寶寶「baby-001」已上傳頭像，URL 為 `/uploads/babies/baby-001/avatar.jpg`
- **WHEN** 用戶呼叫 `GET /api/babies/baby-001`
- **THEN** 系統在回應中包含 `AvatarUrl: /uploads/babies/baby-001/avatar.jpg`

#### Scenario: 無頭像的寶寶返回 null

- **GIVEN** 寶寶「baby-002」未上傳頭像
- **WHEN** 用戶呼叫 `GET /api/babies/baby-002`
- **THEN** 系統在回應中返回 `AvatarUrl: null`，前端自動使用默認頭像
