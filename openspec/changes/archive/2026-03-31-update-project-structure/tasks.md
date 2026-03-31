## 1. 更新前端環境變數

- [x] 1.1 在 `Frontend/.env` 新增 `VITE_IDENTITY_URL=http://localhost:5080`
- [x] 1.2 在 `Frontend/.env` 將 `VITE_API_URL` 改為 `http://localhost:5181`
- [x] 1.3 確認 `Frontend/src/hooks/useLogin.ts` 使用 `VITE_IDENTITY_URL` 作為 connect/token 的 base URL
- [x] 1.4 確認 `Frontend/src/lib/apiClient.ts` 的 refresh token 呼叫使用 `VITE_IDENTITY_URL`

## 2. 驗證後端專案結構

- [x] 2.1 確認 `Backend/src/` 下有 5 個專案：`BaboCare.Domain`、`BaboCare.Application`、`BaboCare.Infrastructure`、`BaboCare.Identity`、`BaboCare.Api`
- [x] 2.2 確認 `Backend/BaboCare.slnx` 的 Project Path 皆指向 `src\<專案名>\...csproj`
- [x] 2.3 確認 `BaboCare.Domain` 的 `csproj` 無多餘 NuGet 套件（`FrameworkReference` + `Ulid` 只）
- [x] 2.4 確認 `BaboCare.Infrastructure` 包含 `Migrations/` 目錄且 namespace 正確（`BaboCare.Infrastructure.Migrations`）
- [x] 2.5 執行 `dotnet build BaboCare.slnx` 確認 0 錯誤 0 警告

## 3. 驗證 Domain 抽象類別

- [x] 3.1 確認 `AggregateRoot.cs` 存在於 `BaboCare.Domain/Abstractions/`
- [x] 3.2 確認 `Specification.cs` 存在於 `BaboCare.Domain/Abstractions/`，且不依賴 EF Core
- [x] 3.3 確認 `ApplicationUserConfiguration.cs` 存在於 `BaboCare.Infrastructure/Persistence/Configurations/`
- [x] 3.4 確認 `AppDbContext.OnModelCreating` 呼叫 `ApplyConfigurationsFromAssembly`

## 4. 驗證 Identity / Api 分離

- [x] 4.1 確認 `BaboCare.Identity/Program.cs` 包含 `DisableAccessTokenEncryption()` 與 `AddDevelopmentEncryptionCertificate()`
- [x] 4.2 確認 `BaboCare.Identity` 的 `launchSettings.json` 使用 port `5080`
- [x] 4.3 確認 `BaboCare.Api/Program.cs` 使用 `SetIssuer("http://localhost:5080/")` + `UseSystemNetHttp()` 做 JWT Validation
- [x] 4.4 確認 `BaboCare.Api` 的 `launchSettings.json` 使用 port `5181`
- [x] 4.5 啟動 `BaboCare.Identity` 並測試 `POST http://localhost:5080/connect/token` 回傳 access_token
