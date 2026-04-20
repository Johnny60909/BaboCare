## Context

系統現有的帳號管理和身份驗證機制已經建立，但缺乏寶寶資料的管理功能。多個角色（系統管理員、保母、家長）需要根據他們的職責範圍與寶寶互動。此設計實現了寶寶資料的完整生命週期管理，包括創建、編輯、查看、以及基於角色的訪問控制。同時，系統核心實現了統一的審計機制，用於追蹤所有主要實體的變更歷史。

### 技術約束

- **後端**：.NET 10、EF Core 10、PostgreSQL（Npgsql）
- **前端**：React、Mantine UI v8、Tailwind CSS、TanStack Query
- **身份驗證**：OpenIddict 提供的 JWT Token 包含 `role` Claim
- **架構模式**：DDD（Domain-Driven Design）、Application Service Pattern

## Goals / Non-Goals

**Goals:**

- 實現寶寶資料的 CRUD 操作API
- 為寶寶與家長、保母建立多對一或多對多的關係
- 基於用戶角色實現寶寶訪問控制（授權策略）
- 在系統核心實現 IAuditable 介面，統一管理 CreatedAt、CreatedBy、UpdatedAt、UpdatedBy
- 前端實現後台寶寶管理頁面，包含列表、新增、編輯功能
- 首頁根據登入用戶類型動態顯示相應的寶寶故事列
- 編輯寶寶時，如果只有1位保母或1位管理員，自動預帶為照護者

**Non-Goals:**

- 實現寶寶成長記錄或日誌功能（屬於獨立的記錄功能）
- 實現寶寶相片存儲或多媒體管理
- 實現寶寶健康檢查或醫療數據記錄
- 實現不同保母對同一寶寶的輪班管理

## Decisions

### 1. 寶寶與人員的關係模型

**選擇**：一個寶寶可以有多位家長（多對多），但只能由一位保母照顧（多對一）

**原理**：

- 家長可能包括父親、母親、祖父母等監護人，因此採用多對多關係
- 寶寶在任何時刻應該只有一位主要照護者（保母），避免責任模糊
- 系統管理員可以在寶寶資料中分配保母

**實現**：

- Baby 聚合根包含 `NannyId`（FK 到 User）
- BabyParent 關聯表實現多對多關係

### 2. 審計欄位的統一管理

**選擇**：使用 IAuditable 介面定義 CreatedAt、CreatedBy、UpdatedAt、UpdatedBy，所有主要聚合根實體實現此介面

**原理**：

- 統一的審計機制便於追蹤所有實體的變更歷史
- 通過介面實現，可在 SaveChangesAsync() 中統一設置這些欄位
- CreatedBy 和 UpdatedBy 存儲用戶 ID（ULID），前端可透過用戶數據進行展示

**實現**：

- Domain/Abstractions/IAuditable.cs 定義介面
- Infrastructure/Persistence 在 SaveChangesAsync 中自動設置（從 ClaimsPrincipal 中讀取 sub Claim）
- Baby 聚合根實現 IAuditable

### 3. 寶寶訪問控制的授權策略

**選擇**：在 API 層實現基於角色和資源所有權的授權策略

**原理**：

- SystemAdmin：可以查看和管理所有寶寶
- Nanny：只能查看和管理他負責的寶寶，以及創建新的寶寶
- Parent：只能查看和管理自己的寶寶

**實現**：

- BabyAuthorizationService 檢查用戶是否有權訪問特定寶寶
- 在 BabyController 中進行授權檢查，返回 403 Forbidden 如無權限
- GET /api/babies 自動根據用戶角色過濾返回的寶寶列表

### 4. 審計欄位的自動設置

**選擇**：在 DbContext.SaveChangesAsync() 中自動設置審計欄位，從 HttpContext 中讀取登入用戶信息

**原理**：

- 避免在每個 Controller 中手動設置這些欄位
- 確保所有實體都被正確審計，降低遺漏風險
- 通過 IHttpContextAccessor 獲取當前用戶的 ClaimsPrincipal

**實現**：

- Infrastructure/Persistence/AppDbContext 重寫 SaveChangesAsync
- 檢查修改過的實體是否實現了 IAuditable
- 從 ClaimsPrincipal 的 sub Claim 中提取用戶 ID

### 5. 編輯頁面的保母自動預帶

**選擇**：在編輯寶寶時，如果系統中只有1位保母或1位管理員，自動預帶

**原理**：

- 提高用戶體驗，避免手動選擇
- 保持簡單邏輯，不引入複雜的自動分配規則

**實現**：

- 編輯頁面加載時，調用 API 查詢保母列表
- 如果列表中只有1項，自動設置為選中狀態

### 6. 寶寶編輯表單的欄位

**選擇**：包含名稱、出生日期、性別、家長選擇、保母選擇、寶寶頭像

**原理**：

- 最小化寶寶資訊，避免過度設計
- 家長和保母的選擇由管理界面提供
- 允許保母ID為空值，提高靈活性
- 寶寶頭像由管理員在後台上傳

**實現**：

- 表單使用 Mantine UI 的 TextInput、DateInput、MultiSelect、Select、FileInput
- 表單驗證：名稱（非空）、出生日期（有效日期）
- 保母ID為可選欄位（允許空值）
- 頭像上傳使用 FileInput，支援 JPG、PNG、GIF 格式

### 7. 首頁寶寶故事列 UI 設計

**選擇**：採用圓形頭像排列方式，類似 Instagram Stories，點擊頭像導航至寶寶詳細頁面

**原理**：

- 符合現代 UI 設計趨勢，用戶已熟悉此交互模式
- 圓形頭像易於識別，適合展示角色身份
- 水平滾動或網格排列取決於寶寶數量

**實現**：

- 使用 Avatar 組件（Mantine UI）展示圓形頭像
- 頭像大小約 80-100px，邊框圓形
- 頭像下方顯示寶寶名稱
- 點擊頭像導航至 `/babies/{babyId}` 詳細頁面
- 若寶寶無上傳頭像，使用性別型預設頭像（藍色/粉色/灰色）
- 響應式設計：小屏幕使用水平滾動，大屏幕使用網格排列

### 8. 寶寶頭像上傳與存儲

**選擇**：在後台寶寶管理頁面支援頭像上傳，上傳的圖檔存儲在伺服器或雲存儲

**原理**：

- 集中管理寶寶頭像，保障數據一致性
- 簡化前端代碼，避免分散的圖檔管理
- 支援圖檔優化和版本控制

**實現**：

- 編輯寶寶表單包含 FileInput 組件用於頭像上傳
- 支援格式：JPG、PNG、GIF
- 上傳時進行圖片驗證和大小限制（如 5MB）
- 上傳成功後，API 回傳頭像 URL
- 頭像存儲路徑：`/uploads/babies/{babyId}/avatar`
- 前端使用此 URL 在故事列和詳細頁面展示頭像

### 9. 寶寶沒有綁定保母時的處理

**選擇**：允許保母ID為空值，系統不強制要求必須綁定保母

**原理**：

- 提高系統靈活性，支援不同的場景（如寶寶待遇療分配、臨時寶寶記錄等）
- 簡化業務邏輯，避免複雜的自動分配規則

**實現**：

- Baby 實體的 NannyId 欄位設為可為空（nullable）
- 編輯表單中保母選擇為可選
- 在首頁故事列中，無保母的寶寶仍可正常顯示
- 在寶寶詳細頁面中，如無保母則顯示「未分配」

### 10. 審計欄位前端展示策略

**選擇**：審計欄位（CreatedAt、CreatedBy、UpdatedAt、UpdatedBy）在後端 API 中返回，但前端不在普通 UI 中展示，僅在管理員頁面的高級檢視中可見

**原理**：

- 避免普通用戶界面的視覺混亂
- 保留審計數據用於系統管理和故障排查
- 根據實際功能需求決定展示策略

**實現**：

- API 回應中繼續包含審計欄位（JSON）
- 前端不在寶寶卡片或詳細頁面中顯示這些欄位
- 如未來需要，可在管理員專用的「審計日誌」頁面中展示

## Risks / Trade-offs

### Risk 1：審計欄位設置依賴 HttpContext

**風險**：後台任務或定時作業可能沒有 HttpContext，導致審計欄位無法設置

**緩解**：

- 檢查 IHttpContextAccessor.HttpContext 是否為 null
- 如果為 null，使用預設值（如 "system" 用戶 ID）
- 或者在後台任務中手動設置這些欄位

### Risk 2：頭像上傳與存儲的文件管理

**風險**：大量頭像上傳可能導致伺服器存儲空間不足或性能下降

**緩解**：

- 實現圖片大小限制和格式驗證
- 使用圖片優化技術（如縮略圖、WebP 轉換）
- 考慮未來遷移至雲存儲服務（如 AWS S3）

### Risk 3：首頁寶寶故事列頭像加載

**風險**：如果寶寶數量多或頭像是外部資源，可能導致頁面加載速度下降

**緩解**：

- 實現分頁或虛擬滾動（virtual scroll）
- 使用圖片優化和 CDN
- 實現客户端緩存

## Migration Plan

### 1. 數據庫遷移

```bash
cd Backend
dotnet ef migrations add AddBabyDataManagement --project BaboCare.Infrastructure --startup-project BaboCare.Api
dotnet ef database update --project BaboCare.Infrastructure --startup-project BaboCare.Api
```

### 2. 部署步驟

1. **後端**：
   - 更新 .API 專案，部署新的 BabyController
   - 更新 .Application 層，部署 BabyService 和 BabyAuthorizationService
   - 更新 .Domain 層，部署 Baby 聚合根和 IAuditable 介面
   - 更新 .Infrastructure 層，部署 EF Core 配置和遷移

2. **前端**：
   - 新增後台寶寶管理頁面（/admin/babies）
   - 修改首頁，新增寶寶故事列顯示邏輯
   - 新增寶寶編輯頁面組件和 API 服務

3. **測試**：
   - 單元測試：Baby 聚合根和授權服務
   - 集成測試：API 端點和寶寶訪問控制
   - UI 測試：後台頁面和首頁寶寶顯示

### 3. 回滾策略

1. 還原前一個數據庫遷移
2. 部署前一個版本的後端代碼
3. 部署前一個版本的前端代碼

## 已解決的問題

✅ **已確認**：

1. 首頁寶寶故事列的 UI 設計採用圓形頭像排列（類似 IG 現實動態）
2. 寶寶故事列頭像由管理員在寶寶管理頁面上傳圖檔
3. 允許寶寶沒有綁定保母（NannyId 可為空值）
4. 審計欄位在前端不展示，僅後端 API 返回
5. 不需要支援多位保母輪班（單一照護者模型）
