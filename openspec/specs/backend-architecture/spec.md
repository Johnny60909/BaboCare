# backend-architecture Specification

## Purpose
TBD - created by archiving change audit-and-align-architecture-docs. Update Purpose after archive.
## Requirements
### Requirement: 後端遵循 Clean Architecture 五層設計

系統後端 SHALL 遵循以下層級結構，層級之間按定義的依賴規則單向依賴：
- **Domain 層**（零依賴）: 包含 `AggregateRoot`、`Specification` 基類、Entity 定義
- **Application 層**（依賴 Domain）: 定義 `IAppDbContext`、Service 接口、DTO 定義
- **Infrastructure 層**（依賴 Application + Domain）: 實現 EF Core `AppDbContext`、Entity Configurations、Database Migrations
- **Identity 層**（獨立模組）: 實現 OpenIddict 身份驗證服務（`BaboCare.Identity`）
- **Api 層**（依賴所有層）: Controllers、依賴注入容器配置、API 路由定義

#### Scenario: 新開發者檢視專案結構時能識別層級

- **GIVEN** 開發者打開 `Backend/src/` 目錄
- **WHEN** 開發者查看專案文件夾結構
- **THEN** 能清楚識別 5 個主要 .csproj 專案及其依賴關係

#### Scenario: 實現新功能時遵循層級依賴規則

- **GIVEN** 需要實現新的業務功能
- **WHEN** 開發者創建新的 Entity、Service、Controller
- **THEN** Entity 放在 Domain，Service 接口在 Application，實現在 Infrastructure，Controller 在 Api

### Requirement: DTO 組織遵循模組封裝原則

系統 SHALL 將 Data Transfer Objects 組織在對應的層級，以維持模組獨立性：
- **核心業務 DTO**（如帳號管理、待驗證帳號）: 放在 `BaboCare.Application/Dtos/`
- **身份驗證 DTO**（如 LoginRequest、TokenResponse）: 放在 `BaboCare.Identity/Dtos/` 以維持 Identity 模組獨立

#### Scenario: API 層使用 Application DTO

- **GIVEN** AdminUsersController 需要回傳帳號列表
- **WHEN** Controller 呼叫 IAdminUserService.GetUsersAsync()
- **THEN** Service 返回 `List<UserListDto>`，其中 UserListDto 定義在 `BaboCare.Application/Dtos/AdminUserDtos.cs`

#### Scenario: Identity 服務使用私有 DTO

- **GIVEN** AuthorizationController 處理登入請求
- **WHEN** Controller 驗證使用者認證
- **THEN** 使用 `BaboCare.Identity/Dtos/` 中的 LoginRequest、TokenResponse，與 Application 層分離

### Requirement: Controllers 保持簡潔並展示正確的返回類型

系統 API Controllers 的每個 Action 方法 SHALL 保持簡潔（單一職責），並適當地標示返回類型。Controllers 可直接返回 DTO（自動轉換為 JSON），無需顯式包裝在 `ActionResult<T>` 中。

#### Scenario: Controller Action 直接返回 DTO

- **GIVEN** 需要實現 GET /api/admin/users/{id} 端點
- **WHEN** 開發者撰寫 `GetUser(string id)` Action
- **THEN** 方法可返回 `Task<UserDetailDto>`，ASP.NET Core 自動序列化為 JSON

#### Scenario: Controller Action 邏輯不超過 30 行

- **GIVEN** 實現新的 Authentication 或業務邏輯
- **WHEN** 開發者撰寫 Controller Action
- **THEN** 方法長度 ≤ 30 行，複雜邏輯委派給 Application Services

### Requirement: Entity Configuration 必須具有資料庫文件

系統中每個 Entity 的 EF Core Configuration 檔（如 `ApplicationUserConfiguration`）SHALL 包含 `.HasComment()` 標註為資料表和欄位提供文件，以改善資料庫可讀性和可維護性。

#### Scenario: 檢視 PostgreSQL 表格註解

- **GIVEN** Database 已包含 `ApplicationUser` 表
- **WHEN** DBA 或開發者使用 pgAdmin 或 psql 查詢表結構
- **THEN** 能看到表格和主要欄位的中文說明

#### Scenario: 新增 Entity Configuration 時自動包含文件

- **GIVEN** 需要新增 Order Entity 和其 Configuration
- **WHEN** 開發者實現 OrderConfiguration
- **THEN** Configuration 包含 `builder.ToTable("orders").HasComment("訂單表")` 及欄位 HasComment()

### Requirement: DDD Pattern 應用於領域實體

系統 Domain 實體應遵循 Domain-Driven Design（DDD）的部分原則。核心業務實體（如 Order、Payment 等）SHALL 繼承 `AggregateRoot`，使用 `TriggerAsync(event)` 進行狀態變更；非業務實體（如 Identity 實體）保持為簡單資料模型。

#### Scenario: 核心業務實體使用 AggregateRoot

- **GIVEN** 需要實現 `Order` Aggregate
- **WHEN** 開發者定義 Order 類別
- **THEN** Order 繼承 `AggregateRoot`，狀態變更透過 `TriggerAsync(OrderPlacedEvent)` 進行

#### Scenario: 身份實體保持簡單

- **GIVEN** ApplicationUser、ApplicationRole 在 Domain 層定義
- **WHEN** 開發者檢視這些類別
- **THEN** 它們為簡單資料模型，不繼承 AggregateRoot（Identity 特例）

### Requirement: Specification 模式用於複雜查詢

系統 Application 層 SHALL 提供 `Specification<T>` 基類，允許 Services 使用規格模式封裝複雜的 LINQ 查詢，以提高代碼可讀性和可重用性。

#### Scenario: 使用 Specification 進行分頁查詢

- **GIVEN** 需要查詢所有已啟用的帳號並分頁
- **WHEN** Service 呼叫 Repository 並傳遞 specification
- **THEN** Specification 封裝 Where 條件、排序、Skip/Take，程式碼簡潔易懂

