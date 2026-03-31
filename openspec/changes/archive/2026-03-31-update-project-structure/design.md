## Context

BaboCare 後端原為單一 `BaboCare.Api.csproj`，包含 Domain、Infrastructure、OpenIddict 等所有程式碼。本次依 `tech-backend.md` 規範完成以下重構：

- 拆分為 5 個專案，全部位於 `Backend/src/`
- OpenIddict Authorization Server 獨立為 `BaboCare.Identity`（port 5080）
- `BaboCare.Api` 成為純 Resource Server，只做 JWT Validation（port 5181）
- Domain 層新增 `AggregateRoot` 與 `Specification<T>` 抽象類別
- Infrastructure 層採用 `IEntityTypeConfiguration<T>` + `ApplyConfigurationsFromAssembly`

## Goals / Non-Goals

**Goals:**
- 記錄最終 5 個專案的目錄結構、依賴關係、職責
- 記錄 OpenIddict Authorization Server / Resource Server 分離架構
- 記錄 Domain 抽象類別的使用規範
- 更新 EF Migration 操作路徑
- 更新前端環境變數規範

**Non-Goals:**
- 本次不實作任何新業務功能
- 不修改資料庫 schema（Migration 已套用）

## Decisions

### 1. 專案依賴關係

```
BaboCare.Domain          ← 零依賴（FrameworkReference only）
BaboCare.Application     ← depends on Domain
BaboCare.Infrastructure  ← depends on Domain, Application
BaboCare.Identity        ← depends on Domain, Application, Infrastructure（Web API）
BaboCare.Api             ← depends on Domain, Application, Infrastructure（Web API）
```

**理由**：遵循 Clean Architecture 的依賴方向，Domain 不依賴任何外部套件（只有 Framework Reference 用於取得 `IdentityUser<string>`）。

### 2. Authorization Server 與 Resource Server 分離

- `BaboCare.Identity`：OpenIddict Server，負責發放 token，使用 `DisableAccessTokenEncryption()` 讓 Access Token 成為可自驗的 JWT
- `BaboCare.Api`：OpenIddict Validation，以 `SetIssuer("http://localhost:5080/")` + `UseSystemNetHttp()` 遠端驗證（JWKS discovery）

**理由**：符合 OAuth2 標準，未來可水平擴展 API 服務而無需共享憑證。  
**替代方案考慮**：`UseLocalServer()` 共享同一進程 → 放棄，因兩個專案已分離。

### 3. Access Token 格式

使用 `DisableAccessTokenEncryption()` 發出明文 JWT。

**理由**：`BaboCare.Api` 為獨立進程，無法使用 `UseLocalServer()`，必須使用標準 JWT Bearer 驗證。

### 4. EF Configuration 規範

使用 `ApplyConfigurationsFromAssembly` 取代手動 `modelBuilder.ApplyConfiguration`。

**理由**：新增實體只需建立 `IEntityTypeConfiguration<T>` 類別，無需修改 `AppDbContext`。

### 5. Specification 設計

`Specification<T>` 保持純 LINQ Expression（`System.Linq.Expressions`），不依賴 EF Core。

**理由**：維持 Domain 零外部依賴原則；EF Core 的 `Include` 在 Infrastructure 層讀取 Specification 時套用。

## Risks / Trade-offs

| 風險 | 緩解方式 |
|------|---------|
| `BaboCare.Api` 啟動時需連線至 Identity（JWKS） | 開發環境先啟動 Identity 再啟動 Api；Production 設定 retry policy |
| Development certificate 重啟後可能失效 | 已使用 `AddDevelopmentEncryptionCertificate` + `AddDevelopmentSigningCertificate`，重啟後自動重新產生 |
| Migration 指令需在正確目錄執行 | 文件化：一律在 `Backend/src/BaboCare.Infrastructure/` 執行 `dotnet ef` |

## Migration Plan

已完成：
1. 舊 `Backend/` 根目錄專案已移除
2. 5 個新專案已建立於 `Backend/src/`
3. Migration 已複製至 `BaboCare.Infrastructure/Migrations/`（namespace 已更新）
4. `BaboCare.slnx` 已更新為新路徑
5. 前端 `useLogin.ts` 和 `apiClient.ts` 的 auth endpoint 已改為 `VITE_IDENTITY_URL`

待補：
- `Frontend/.env` 補上 `VITE_IDENTITY_URL=http://localhost:5080`
- `VITE_API_URL` 從舊的 `5180` 改為 `5181`（新 Api port）

**Rollback**：從 `openspec/changes/archive/2026-03-31-add-auth-login/` 可取得舊版設計文件；git history 可還原程式碼。

## Open Questions

- `BaboCare.Api` 的 OpenIddict Validation 是否需要設定 introspection（目前用 JWT local validation）？→ 目前不需要，JWT 已包含足夠資訊
