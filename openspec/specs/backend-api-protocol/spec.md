# Backend API Protocol Specification

## Purpose

定義 BaboCare 後端 API 的統一響應協議、錯誤處理、CORS 配置和數據格式標準，確保前後端通信的一致性和可靠性。

## Requirements

### Requirement: 統一響應格式 (JsonResponse)

系統後端所有 API 端點 SHALL 返回統一的 JSON 響應格式 `JsonResponse<T>`，包含狀態碼、訊息和數據負載，確保前端能夠以統一方式處理所有響應。

#### Response Structure

所有響應 SHALL 遵循以下結構：

```typescript
interface JsonResponse<T = any> {
  state: ResponseStateEnum; // 響應狀態碼
  message: string | null; // 錯誤或提示訊息
  result: T; // 實際數據
}

enum ResponseStateEnum {
  Success = 111, // 操作成功
  NotFound = 493, // 資源不存在
  NoPermission = 495, // 權限不足
  Error = 999, // 通用錯誤
}
```

#### Implementation Rules

- **Success (111)**: `Message` 必須為 `null`，`Result` 包含業務數據
- **NotFound (493)**: 用於業務邏輯層資源不存在情況，`Message` 描述缺失的資源
- **NoPermission (495)**: 用於認證/授權失敗，`Message` 說明權限要求
- **Error (999)**: 由 `ApiExceptionFilter` 自動設置，包含異常訊息

#### Scenario: 成功查詢帳號列表

- **GIVEN** 客戶端發起 GET /api/admin/users 請求
- **WHEN** 伺服器查詢並取得帳號列表
- **THEN** 返回:

```json
{
  "state": 111,
  "message": null,
  "result": [
    { "id": "user_1", "userName": "admin", "displayName": "管理員" },
    { "id": "user_2", "userName": "nanny", "displayName": "保母" }
  ]
}
```

#### Scenario: 帳號不存在

- **GIVEN** 客戶端請求不存在的帳號詳情
- **WHEN** Service 檢查帳號 ID 並未找到
- **THEN** Controller 返回:

```json
{
  "state": 493,
  "message": "帳號不存在",
  "result": null
}
```

### Requirement: 分頁響應格式 (JsonTableResponse)

系統 API 返回集合數據時 SHALL 使用 `JsonTableResponse<T>` 格式，包含分頁元數據（總數、當前頁、頁面大小）。

#### Response Structure

```typescript
interface JsonTableResponse<T> extends JsonResponse<T[]> {
  total: number; // 總記錄數
}
```

#### Scenario: 分頁查詢帳號列表

- **GIVEN** 客戶端發起 GET /api/admin/users?page=1&pageSize=10
- **WHEN** 伺服器查詢分頁數據
- **THEN** 返回:

```json
{
  "state": 111,
  "message": null,
  "result": [
    { "id": "user_1", "userName": "admin", "displayName": "管理員" },
    { "id": "user_2", "userName": "nanny", "displayName": "保母" }
  ],
  "total": 25
}
```

### Requirement: 全域異常過濾器 (ApiExceptionFilter)

系統 API 層 SHALL 使用全域 `ApiExceptionFilter` 攔截所有未處理的異常，自動轉換為 `JsonResponse` 格式並返回 HTTP 200 狀態碼（狀態由 `state` 欄位表示）。

#### Exception Mapping

過濾器 SHALL 將以下異常類型映射到對應的 `state` 值：

| 異常類型                      | State | HTTP Code |
| ----------------------------- | ----- | --------- |
| `ValidationException`         | 999   | 200       |
| `KeyNotFoundException`        | 493   | 200       |
| `UnauthorizedAccessException` | 495   | 200       |
| `InvalidOperationException`   | 999   | 200       |
| 其他異常                      | 999   | 200       |

#### Scenario: Service 拋出驗證異常

- **GIVEN** 建立帳號時缺少必需欄位
- **WHEN** Service 拋出 `ValidationException`
- **THEN** Filter 攔截異常並返回:

```json
{
  "state": 999,
  "message": "帳號名稱不能為空",
  "result": null
}
```

HTTP 狀態碼為 200

#### Scenario: 無錯誤處理程式碼中直接拋出異常

- **GIVEN** 開發者在 Service 或 Repository 中未捕獲異常
- **WHEN** 異常在執行過程中發生
- **THEN** Filter 自動捕獲並返回:

```json
{
  "state": 999,
  "message": "內部伺服器錯誤：[異常消息]",
  "result": null
}
```

### Requirement: CORS 配置支持開發環境

系統 API 層 SHALL 配置 CORS 策略以支持前端開發環境（localhost 上的多個端口），同時在生產環境限制跨域請求。

#### Development Environment CORS Rules

- **允許來源**: `http://localhost:5173`、`http://localhost:5174` 及其他開發端口
- **允許方法**: GET、POST、PUT、DELETE、OPTIONS、PATCH
- **允許標頭**: Content-Type、Authorization 及其他必需標頭
- **允許認證**: 支持 Cookie 和 Bearer Token

#### Implementation

在 Program.cs 中配置：

```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
```

#### Scenario: 開發環境跨域請求

- **GIVEN** 前端應用在 `http://localhost:5174` 執行
- **WHEN** 發起 POST 請求到 `http://localhost:5181/api/account/pending/register`
- **THEN** 伺服器返回 CORS 預檢 OPTIONS 響應 (204)，包含 `Access-Control-Allow-Origin: http://localhost:5174`，隨後允許 POST 請求

#### Scenario: 非允許來源跨域請求

- **GIVEN** 請求來自 `http://external-domain.com`
- **WHEN** 發起跨域請求到 API
- **THEN** 伺服器返回 CORS 錯誤，瀏覽器阻止請求

### Requirement: DTO 設計標準

系統後端所有 DTO 必須遵循統一的設計標準，確保數據結構清晰、型別安全、易於序列化。

#### DTO Organization

- **Request DTO**: 命名為 `{Feature}RequestDto`，位於 `Application/Dtos/{Feature}/`
- **Response DTO**: 命名為 `{Feature}ResponseDto`，位於 `Application/Dtos/{Feature}/`
- **Validation**: 使用 `FluentValidation` 或 Data Annotations

#### Scenario: 建立帳號的 Request DTO

- **GIVEN** 建立帳號時需要驗證輸入
- **WHEN** 開發者定義 `CreateAccountRequestDto`
- **THEN** DTO 包含必需欄位驗證:

```csharp
public class CreateAccountRequestDto
{
    [Required(ErrorMessage = "帳號不能為空")]
    [StringLength(50, MinimumLength = 3)]
    public string UserName { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; set; }
}
```

#### Scenario: 帳號詳情的 Response DTO

- **GIVEN** 查詢帳號詳情後返回數據
- **WHEN** Service 返回帳號數據
- **THEN** Controller 序列化為 `UserDetailDto`:

```csharp
public class UserDetailDto
{
    public string Id { get; set; }
    public string UserName { get; set; }
    public string DisplayName { get; set; }
    public string Email { get; set; }
    public List<string> Roles { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

### Requirement: HTTP 方法遵循 RESTful 慣例

系統 API 端點 SHALL 遵循 RESTful HTTP 方法慣例，確保 API 易於理解和使用。

#### HTTP Method Mapping

| 操作 | HTTP 方法 | 端點範例          | Response                     |
| ---- | --------- | ----------------- | ---------------------------- |
| 列表 | GET       | `/api/users`      | `JsonTableResponse<UserDto>` |
| 詳情 | GET       | `/api/users/{id}` | `JsonResponse<UserDto>`      |
| 建立 | POST      | `/api/users`      | `JsonResponse<UserDto>`      |
| 更新 | PUT       | `/api/users/{id}` | `JsonResponse<UserDto>`      |
| 刪除 | DELETE    | `/api/users/{id}` | `JsonResponse<void>`         |

#### Scenario: 刪除帳號

- **GIVEN** 使用者有刪除帳號的權限
- **WHEN** 發起 DELETE /api/admin/users/{id} 請求
- **THEN** 伺服器返回:

```json
{
  "state": 111,
  "message": null,
  "result": null
}
```

### Requirement: 認證 Token 管理

系統 API 層 SHALL 實現 Bearer Token 認證機制，使用 OpenIddict 標準，支持 Token 自動刷新和過期處理。

#### Token Flow

1. **登入**: POST `/auth/login` → 返回 `access_token` 和 `refresh_token`
2. **API 請求**: 在 `Authorization: Bearer {access_token}` 標頭中發送 Token
3. **Token 過期**: 攔截器自動使用 `refresh_token` 重新申請新 `access_token`
4. **刷新失敗**: 重定向至 `/login`

#### Scenario: 使用 Bearer Token 請求受保護資源

- **GIVEN** 使用者已登入並持有有效 access_token
- **WHEN** 發起 GET /api/babies，標頭包含 `Authorization: Bearer eyJhbGc...`
- **THEN** 伺服器驗證 Token，返回帳號關聯的寶寶列表

#### Scenario: Token 過期自動刷新

- **GIVEN** Access Token 已過期
- **WHEN** 客戶端攔截器檢測到 401 響應
- **THEN** 攔截器使用 refresh_token 向 `/connect/token` 申請新 access_token，自動重試原請求
