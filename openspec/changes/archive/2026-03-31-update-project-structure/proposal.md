## Why

先前所有後端程式碼放在單一專案 `BaboCare.Api`。隨著功能增加，需要依 Clean Architecture 規範將程式碼拆分為 Domain、Application、Infrastructure、Identity、Api 五個獨立專案，並調整目錄結構（所有專案移至 `Backend/src/`），同時補充 Domain 層的抽象類別（`AggregateRoot`、`Specification<T>`）與 EF Configuration 規範。目前 repository 的實際結構已完成拆分，但設計文件尚未反映最新狀態。

## What Changes

- 後端目錄結構從單一 `Backend/BaboCare.Api.csproj` 拆分為 5 個專案，全部置於 `Backend/src/`
- 新增 `Backend/tests/` 作為測試專案的根目錄（預留）
- `BaboCare.Domain` 新增 `AggregateRoot` 與 `Specification<T>` 抽象類別
- `BaboCare.Infrastructure` 新增 EF Entity Configuration 規範（`IEntityTypeConfiguration<T>`），`AppDbContext.OnModelCreating` 改用 `ApplyConfigurationsFromAssembly`
- OpenIddict 從原本與 API 共用，拆分至獨立的 `BaboCare.Identity` Web API 專案（port 5080）
- `BaboCare.Api` 改為純資源伺服器，使用 OpenIddict Validation 遠端驗證 token（port 5181）
- 前端 auth 呼叫（`/connect/token`）改指向 `VITE_IDENTITY_URL`，業務 API 呼叫維持 `VITE_API_URL`

## Capabilities

### New Capabilities

- `project-structure`: 後端 Clean Architecture 目錄結構，含 5 個專案的依賴關係與職責定義

### Modified Capabilities

- `user-auth`: Identity Server 拆分為獨立專案（`BaboCare.Identity`），前端 auth endpoint URL 從 `VITE_API_URL` 改為 `VITE_IDENTITY_URL`

## Impact

- **Backend**: 所有相對路徑（`dotnet run`、`dotnet ef`）需指向 `Backend/src/<專案名稱>/`
- **Frontend**: `.env` 需新增 `VITE_IDENTITY_URL=http://localhost:5080`，`VITE_API_URL` 改為 `http://localhost:5181`
- **EF Migrations**: 往後新增 migration 需在 `Backend/src/BaboCare.Infrastructure/` 執行
- **Rollback**: 如需回退，可從 `openspec/changes/archive/2026-03-31-add-auth-login/` 還原舊結構
- **Affected Teams**: 後端全部、前端 API 呼叫部分
