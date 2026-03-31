## ADDED Requirements

### Requirement: 後端採用 Clean Architecture 五專案結構

後端 SHALL 由以下五個專案組成，全部置於 `Backend/src/`，依賴關係嚴格遵循由外向內方向：

| 專案                      | 類型          | 主要職責                                  |
| ------------------------- | ------------- | ----------------------------------------- |
| `BaboCare.Domain`         | Class Library | 實體、`AggregateRoot`、`Specification<T>` |
| `BaboCare.Application`    | Class Library | Use Cases、介面定義                       |
| `BaboCare.Infrastructure` | Class Library | EF Core、Migrations、Configurations       |
| `BaboCare.Identity`       | Web API       | OpenIddict Authorization Server           |
| `BaboCare.Api`            | Web API       | 業務 API、OpenIddict Resource Server      |

#### Scenario: Domain 零外部依賴

- **GIVEN** `BaboCare.Domain.csproj` 存在
- **WHEN** 開發者檢視其 `<PackageReference>` 清單
- **THEN** 除 `FrameworkReference Include="Microsoft.AspNetCore.App"` 與 `Ulid` 外，不應包含其他 NuGet 套件

#### Scenario: 依賴方向正確

- **GIVEN** 任一專案的 `<ProjectReference>`
- **WHEN** 追蹤所有依賴鏈
- **THEN** 依賴方向必須為 Api/Identity → Infrastructure → Application → Domain，不得出現反向依賴

### Requirement: Domain 必須使用 AggregateRoot 作為 Aggregate 根

所有 Aggregate Root 實體 SHALL 繼承 `BaboCare.Domain.Abstractions.AggregateRoot`，狀態變更 MUST 透過 `TriggerAsync(event)` 觸發。

#### Scenario: 透過 TriggerAsync 觸發狀態變更

- **GIVEN** 一個繼承 `AggregateRoot` 的實體
- **WHEN** 呼叫 `TriggerAsync(event)`
- **THEN** 系統依序執行 `EnsureValidStateAsync`、`WhenAsync`，並將 event 加入 `DomainEvents`

#### Scenario: 直接修改屬性被視為違規

- **GIVEN** 一個 Aggregate Root 實體
- **WHEN** 外部程式碼直接賦值其公開屬性以改變業務狀態
- **THEN** 視為規範違規，MUST 改由對應的 `TriggerAsync` 實作

### Requirement: Infrastructure 的 EF 實體設定必須使用 Configuration 類別

每個 EF 實體 SHALL 有對應的 `IEntityTypeConfiguration<T>` 類別，放於 `BaboCare.Infrastructure/Persistence/Configurations/`，`AppDbContext.OnModelCreating` MUST 使用 `ApplyConfigurationsFromAssembly`。

#### Scenario: 新增實體時建立對應 Configuration

- **GIVEN** 開發者建立新的 Domain 實體並加入 `AppDbContext`
- **WHEN** 實體需要 EF mapping 設定
- **THEN** 開發者 SHALL 在 `Configurations/` 建立對應的 `<Entity>Configuration : IEntityTypeConfiguration<Entity>` 類別，而非在 `OnModelCreating` 直接呼叫 `builder`

### Requirement: EF Migration 操作 MUST 在 Infrastructure 專案目錄執行

所有 `dotnet ef` 指令 SHALL 在 `Backend/src/BaboCare.Infrastructure/` 目錄下執行。

#### Scenario: 新增 Migration

- **GIVEN** 開發者需要為 Schema 變更建立新 Migration
- **WHEN** 執行 `dotnet ef migrations add <Name>`
- **THEN** 指令 MUST 在 `Backend/src/BaboCare.Infrastructure/` 目錄下執行，Migration 檔案 MUST 產生於該目錄的 `Migrations/` 子目錄
