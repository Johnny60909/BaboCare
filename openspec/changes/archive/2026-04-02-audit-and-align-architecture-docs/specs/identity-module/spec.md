## ADDED Requirements

### Requirement: Identity 服務使用 OpenIddict 和 PostgreSQL

系統身份驗證服務（`BaboCare.Identity`）SHALL 使用 OpenIddict 作為 OAuth2 授權伺服器，並將所有 token、應用程式配置存儲在 PostgreSQL 資料庫中（透過 EF Core）。

#### Scenario: OpenIddict 初始化

- **GIVEN** 系統啟動時
- **WHEN** OpenIddict 相關 DbSet 檢查表是否存在
- **THEN** 如果表不存在，EF Core Migration 將自動建立 OpenIddict 所需的表（OpenIddictApplications、OpenIddictAuthorizations、OpenIddictTokens 等）

#### Scenario: Token 存儲在 PostgreSQL

- **GIVEN** 用戶成功登入並獲得 Token
- **WHEN** OpenIddict 生成並簽名 Token
- **THEN** Token 相關的授權信息被持久化到 PostgreSQL 資料庫中

### Requirement: 實現 Password Grant 流程

系統身份驗證 SHALL 支援 OAuth2 Password Grant 流程，允許用戶透過用戶名和密碼直接獲取 Access Token 和 Refresh Token。

#### Scenario: Password Grant 端點

- **GIVEN** 用戶想要登入系統
- **WHEN** 向 `POST /connect/token` 端點發送請求，參數為 `grant_type=password&username=user&password=pass`
- **THEN** 如果驗證成功，OpenIddict 返回 `access_token`、`refresh_token`、`token_type=Bearer`、`expires_in`

#### Scenario: 密碼驗證

- **GIVEN** 登入請求包含 username 和 password
- **WHEN** OpenIddict 處理 Password Grant 請求
- **THEN** 系統驗證密碼是否符合存儲的用戶密碼（透過 ASP.NET Identity 的密碼驗證流程）

### Requirement: 轉移到 Password Grant 且停用加密的 Access Token

系統 OAuth2 流程 SHALL 停用 Access Token 加密（`DisableAccessTokenEncryption = true`），使 Access Token 以明文 JWT 格式發出，方便前端解析 Claims。Token 始終由 OpenIddict 使用簽名密鑰進行簽名，確保完整性和真實性。

#### Scenario: Access Token 格式

- **GIVEN** 用戶成功登入
- **WHEN** OpenIddict 生成並返回 Access Token
- **THEN** Access Token 是可讀的 JWT 格式（header.payload.signature），前端可直接解析 `payload` 部分以獲取 Claims（如 `sub`、`name`、`role` 等）

#### Scenario: Token 簽名驗證

- **GIVEN** 前端在請求中附加 Access Token
- **WHEN** 後端 API 驗證該 Token
- **THEN** 後端驗證簽名是否有效，確保 Token 未被篡改

### Requirement: 前端需具備 Bearer Token 攔截器以自動附加認證

儘管 Identity 模組負責發行 Token，但前端 Axios 配置 SHALL 包含自動將 Bearer Token 附加到每個 API 請求 Header(`Authorization: Bearer <token>`) 的攔截器，以便所有後端 API 端點可驗證用戶身份。

#### Scenario: Axios 攔截器附加 Token

- **GIVEN** 前端已登入並存儲了 Access Token
- **WHEN** 前端發出 API 請求至後端
- **THEN** Axios 攔截器自動將 `Authorization: Bearer <token>` 附加到請求 Header

#### Scenario: 攔截器處理 Token 過期

- **GIVEN** 前端發出 API 請求並收到 HTTP 401 Unauthorized
- **WHEN** Axios 攔截器檢測到 401 響應
- **THEN** 攔截器自動使用 Refresh Token 呼叫 `/connect/token` 換取新的 Access Token，並重試原始請求

### Requirement: 實現非同步 IUserContext 以從 Claims 提取 UserId

後端 API 層 Services 和 Controllers 需要存取目前登入用戶的 Claims，系統 SHALL 提供非同步 `IUserContext` 介面，允許 Services 透過 `GetUserIdAsync()` 等方法從 Claims 中非同步提取用戶信息（如 `sub` Claim 對應的 UserId）。

#### Scenario: Controller 在 Service 調用中獲取用戶 ID

- **GIVEN** Admin API 端點需要取得目前登入用戶的 ID
- **WHEN** Controller 方法呼叫 Service，Service 透過 `IUserContext.GetUserIdAsync()` 取得用戶 ID
- **THEN** Service 異步取得用戶 ID（從 HttpContext.User.Claims 中解析），并用於業務邏輯（如過濾數據、建立審計日誌）

#### Scenario: IUserContext 的非同步設計

- **GIVEN** Service 層需呼叫 IUserContext
- **WHEN** Service 調用 `await userContext.GetUserIdAsync()` 或類似方法
- **THEN** 方法返回 Task/ValueTask，Service 使用 await 等待結果，確保現代非同步模式

### Requirement: Identity 模組在獨立的 HTTPS 端口上運行

系統身份驗證服務（`BaboCare.Identity`）SHALL 在獨立的 HTTPS 端口（預設 `https://localhost:5080`）上運行，與主 API（`https://localhost:5001`）分離。前端透過環境變數 `VITE_IDENTITY_URL` 指定 Identity 端點，與 Business API 端點 `VITE_API_URL` 分開配置。

#### Scenario: Environment 配置

- **GIVEN** 前端應用啟動
- **WHEN** 讀取環境變數 `VITE_IDENTITY_URL` 和 `VITE_API_URL`
- **THEN** 平臺能指向不同的 Identity 和 API 端點（開發時為 `localhost:5080` 和 `localhost:5001`，生產可為不同的域或子域）

#### Scenario: CORS 配置

- **GIVEN** 前端應用在不同的域或端口
- **WHEN** 前端發出跨域請求至 Identity 端點
- **THEN** Identity 服務的 CORS 策略允許来自前端的請求
