# baby-access-control Specification

## Purpose

實現基於用戶角色和資源所有權的寶寶訪問控制機制，確保只有授權的用戶可以查看和修改特定的寶寶資訊。

## ADDED Requirements

### Requirement: 系統實現基於角色的寶寶訪問控制

系統 SHALL 根據登入用戶的角色和關係實現寶寶訪問控制：

- **系統管理員 (SystemAdmin)**：可以查看、建立和編輯所有寶寶資訊
- **保母 (Nanny)**：只能查看和編輯自己負責照顧的寶寶，可以建立新寶寶並自動成為照護者
- **家長 (Parent)**：只能查看自己綁定的寶寶，無法編輯或建立寶寶

未授權的訪問請求 SHALL 回傳 HTTP 403 Forbidden。

#### Scenario: 系統管理員訪問任何寶寶

- **GIVEN** 用戶已登入且角色為 `SystemAdmin`
- **WHEN** 用戶訪問任何寶寶的 API 端點
- **THEN** 系統授予訪問權限

#### Scenario: 保母訪問自己負責的寶寶

- **GIVEN** 用戶已登入且角色為 `Nanny`，負責照顧「baby-001」
- **WHEN** 用戶訪問「baby-001」的 API 端點
- **THEN** 系統授予訪問權限

#### Scenario: 保母訪問其他保母負責的寶寶

- **GIVEN** 用戶已登入且角色為 `Nanny`，不負責「baby-999」
- **WHEN** 用戶訪問「baby-999」的 GET 或 PUT 端點
- **THEN** 系統回傳 HTTP 403 Forbidden

#### Scenario: 家長訪問自己的寶寶

- **GIVEN** 用戶已登入且角色為 `Parent`，綁定到「baby-001」
- **WHEN** 用戶呼叫 `GET /api/babies/baby-001`
- **THEN** 系統授予訪問權限，回傳該寶寶的詳細資訊

#### Scenario: 家長訪問其他家長的寶寶

- **GIVEN** 用戶已登入且角色為 `Parent`，不綁定「baby-999」
- **WHEN** 用戶呼叫 `GET /api/babies/baby-999`
- **THEN** 系統回傳 HTTP 403 Forbidden

### Requirement: 系統在列表查詢時自動過濾寶寶

系統 SHALL 在 `GET /api/babies` 端點上自動根據登入用戶的角色過濾寶寶列表，而不是回傳所有寶寶後讓客戶端進行過濾。

#### Scenario: 系統管理員查詢時回傳所有寶寶

- **GIVEN** 用戶已登入且角色為 `SystemAdmin`，系統中有 10 個寶寶
- **WHEN** 用戶呼叫 `GET /api/babies`
- **THEN** 系統回傳全部 10 個寶寶

#### Scenario: 保母查詢時只回傳他負責的寶寶

- **GIVEN** 用戶已登入且角色為 `Nanny`，負責 3 個寶寶
- **WHEN** 用戶呼叫 `GET /api/babies`
- **THEN** 系統只回傳該保母負責的 3 個寶寶，不包含其他寶寶

#### Scenario: 家長查詢時只回傳他的寶寶

- **GIVEN** 用戶已登入且角色為 `Parent`，綁定 2 個寶寶
- **WHEN** 用戶呼叫 `GET /api/babies`
- **THEN** 系統只回傳該家長綁定的 2 個寶寶

### Requirement: 系統在修改寶寶資訊時驗證授權

系統 SHALL 在 PUT 和 DELETE 操作前檢查用戶是否有權修改該寶寶。只有系統管理員和負責該寶寶的保母可以編輯寶寶資訊。

#### Scenario: 系統管理員編輯任何寶寶

- **GIVEN** 用戶已登入且角色為 `SystemAdmin`
- **WHEN** 用戶呼叫 `PUT /api/babies/baby-001`
- **THEN** 系統授予編輯權限

#### Scenario: 保母編輯自己負責的寶寶

- **GIVEN** 用戶已登入且角色為 `Nanny`，負責「baby-001」
- **WHEN** 用戶呼叫 `PUT /api/babies/baby-001`
- **THEN** 系統授予編輯權限

#### Scenario: 家長無法編輯寶寶

- **GIVEN** 用戶已登入且角色為 `Parent`，綁定「baby-001」
- **WHEN** 用戶嘗試呼叫 `PUT /api/babies/baby-001`
- **THEN** 系統回傳 HTTP 403 Forbidden

### Requirement: 系統在刪除寶寶時驗證授權

系統 SHALL 只允許系統管理員刪除寶寶資訊。保母和家長無法執行刪除操作。

#### Scenario: 系統管理員刪除寶寶

- **GIVEN** 用戶已登入且角色為 `SystemAdmin`
- **WHEN** 用戶呼叫 `DELETE /api/babies/baby-001`
- **THEN** 系統授予刪除權限，寶寶被刪除或標記為已刪除

#### Scenario: 保母無法刪除寶寶

- **GIVEN** 用戶已登入且角色為 `Nanny`
- **WHEN** 用戶嘗試呼叫 `DELETE /api/babies/baby-001`
- **THEN** 系統回傳 HTTP 403 Forbidden

#### Scenario: 家長無法刪除寶寶

- **GIVEN** 用戶已登入且角色為 `Parent`
- **WHEN** 用戶嘗試呼叫 `DELETE /api/babies/baby-001`
- **THEN** 系統回傳 HTTP 403 Forbidden

### Requirement: 系統提供 IAuditable 介面用於統一審計欄位管理

所有主要聚合根實體 SHALL 實現 `IAuditable` 介面，包含以下審計欄位：

- `CreatedAt` (DateTime)：實體建立時間
- `CreatedBy` (string/UserId)：建立實體的用戶 ID
- `UpdatedAt` (DateTime?)：實體最後更新時間
- `UpdatedBy` (string/UserId?)：最後更新實體的用戶 ID

系統 SHALL 在實體被建立或修改時自動設置這些欄位，無需應用層手動設置。

#### Scenario: 建立寶寶時自動設置審計欄位

- **GIVEN** 用戶 ID 為「user-001」已登入
- **WHEN** 用戶建立新寶寶
- **THEN** 新寶寶的 `CreatedAt` 被設置為當前時間，`CreatedBy` 被設置為「user-001」

#### Scenario: 編輯寶寶時自動更新審計欄位

- **GIVEN** 寶寶「baby-001」的 `UpdatedAt` 為「2026-01-01 10:00:00」，最後修改者為「user-002」
- **WHEN** 用戶 ID 為「user-003」修改「baby-001」
- **THEN** `UpdatedAt` 被更新為當前時間，`UpdatedBy` 被更新為「user-003」

### Requirement: 系統在 API 回傳中包含審計欄位

所有寶寶相關的 API 回應 SHALL 包含審計欄位（CreatedAt、CreatedBy、UpdatedAt、UpdatedBy）以及頭像信息（AvatarUrl），供前端展示或用於審計追蹤。若寶寶無上傳頭像，AvatarUrl 應為 null，前端將使用默認頭像。

#### Scenario: GET 寶寶詳細資訊時回傳審計欄位和頭像

- **GIVEN** 用戶查詢寶寶詳細資訊，寶寶「baby-001」已上傳頭像
- **WHEN** 用戶呼叫 `GET /api/babies/baby-001`
- **THEN** 系統在回應中包含 `CreatedAt`、`CreatedBy`、`UpdatedAt`、`UpdatedBy` 欄位以及 `AvatarUrl: /uploads/babies/baby-001/avatar.jpg`

#### Scenario: 無頭像的寶寶返回 null AvatarUrl

- **GIVEN** 寶寶「baby-002」未上傳頭像
- **WHEN** 用戶呼叫 `GET /api/babies/baby-002`
- **THEN** 系統在回應中返回 `AvatarUrl: null`
