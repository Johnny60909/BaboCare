## ADDED Requirements

### Requirement: 前端遵循 React + TypeScript 的組件堆棧

系統前端 SHALL 使用以下技術堆棧：
- **框架**: React 19.2.4 with React Router 7.13.2（SPA 模式）
- **UI 元件庫**: Mantine UI 8.3.18（非 v7）
- **樣式方案**: Tailwind CSS 4.2.2（Utility-first layouts）
- **伺服器狀態**: TanStack Query (React Query) 5.95.2（API 資料快取與同步）
- **本地狀態**: Zustand 5.0.12（UI-only 狀態管理，如 Sidebar toggle）
- **圖示**: lucide-react 1.7.0 與 @tabler/icons-react 3.41.1
- **HTTP 客戶端**: Axios 1.14.0（含 Token 攔截器）

#### Scenario: 新專案成員設置開發環境

- **GIVEN** 開發者複製專案並執行 `npm install`
- **WHEN** 檢查 package.json 中的依賴版本
- **THEN** 所有依賴都是最新穩定版本，能正常載入並無版本衝突

#### Scenario: 組件使用 Mantine v8 API

- **GIVEN** 需要實現一個 Modal 表單
- **WHEN** 開發者使用 Mantine v8 API（如 `useDisclosure`）
- **THEN** 元件正常工作，無法使用 v6 的過時 API（如 `createStyles`）

### Requirement: 組件與邏輯分離（MVVM 模式）

系統前端 SHALL 遵循 MVVM（Model-View-ViewModel）模式，清晰分離表現層與業務邏輯：
- **View** (.tsx 檔案)：只負責 UI 渲染，不含複雜邏輯或原始 `useEffect` 資料取得
- **Logic** (.ts 檔案 - Custom Hooks)：負責 API 呼叫、狀態計算、Form 驗證、事件觸發
- **Data** (DTO)：定義型別安全的資料結構

#### Scenario: 帳號列表頁面組件

- **GIVEN** 需要實現 AdminUsersPage 顯示帳號列表
- **WHEN** 開發者撰寫 AdminUsersPage.tsx
- **THEN** 頁面使用 `useAdminUsers()` Custom Hook 取得資料，只負責渲染（无 API 呼叫邏輯）

#### Scenario: 自定義 Hook 封裝業務邏輯

- **GIVEN** 帳號登入邏輯需重複使用
- **WHEN** 開發者在 src/hooks/useLogin.ts 定義 Hook
- **THEN** Hook 封裝帳號驗證、Token 存儲、錯誤處理，元件使用時無需了解實作細節

### Requirement: DTO 定義在 src/api/dtos/ 並嚴格型別化

系統前端所有 Data Transfer Objects 必須定義在 `src/api/dtos/` 目錄，且所有型別定義 SHALL 用 TypeScript interfaces，禁止使用 `any` 型別。

#### Scenario: 帳號管理 DTO 定義

- **GIVEN** 需要定義帳號列表和詳情的資料結構
- **WHEN** 開發者在 src/api/dtos/ 建立 admin-user.dto.ts
- **THEN** 定義 `interface UserListDto`、`interface UserDetailDto` 等，所有欄位都有具體型別

#### Scenario: DTO 型別檢查

- **GIVEN** Service 使用 DTO
- **WHEN** 開發者取得 API 回應並轉為 DTO
- **THEN** TypeScript 編譯器驗證回應資料符合 DTO 型別定義，不允許 `any`

### Requirement: API 呼叫封裝在 Service 物件

系統前端所有 HTTP 呼叫 SHALL 封裝在位於 `src/api/services/` 的 Service 物件中，Components 不直接使用 Axios。每個 Service 對應一個業務領域（如 auth.service.ts、admin-user.service.ts）。

#### Scenario: 建立帳號管理 Service

- **GIVEN** 需要實現帳號 CRUD 操作的 API 呼叫
- **WHEN** 開發者在 src/api/services/ 建立 admin-user.service.ts
- **THEN** Service 導出方法如 `getUsers()`、`createUser(req)`、`updateUser(id, req)` 等，各方法返回 `Promise<DTO>`

#### Scenario: Component 使用 Service

- **GIVEN** AdminUsersPage 需要載入帳號列表
- **WHEN** 頁面的 Custom Hook 呼叫 `adminUserService.getUsers()`
- **THEN** Hook 返回查詢結果，Component 只負責渲染

### Requirement: 使用 TanStack Query 管理伺服器狀態

系統前端 SHALL 使用 TanStack Query (React Query) 管理所有伺服器狀態（API 回應資料），包括快取、同步、重試邏輯。Custom Hooks 位於 `src/hooks/queries/` 目錄，每個 Hook 包裝 `useQuery` 或 `useMutation`。

#### Scenario: 查詢 Hook 封裝

- **GIVEN** 需要取得帳號詳情，且支援快取和重新驗證
- **WHEN** 開發者在 src/hooks/queries/useAdminUsers.ts 定義 `useAdminUserDetail(id)`
- **THEN** Hook 使用 `useQuery`，自動快取結果，支援 React Query 的 staleTime、gcTime 等配置

#### Scenario: 修改 Mutation 封裝

- **GIVEN** 需要實現建立帳號的操作
- **WHEN** 開發者定義 `useCreateUserMutation()`
- **THEN** Hook 使用 `useMutation`，在成功時自動重新驗證帳號列表，失敗時觸發 UI 通知

### Requirement: 本地 UI 狀態使用 Zustand

系統前端 UI-only 狀態（如 Sidebar 展開/收合、Modal 開關、主題偏好）SHALL 使用 Zustand 存儲，不應存儲 API 回應資料（該部分由 React Query 管理）。

#### Scenario: Sidebar 切換狀態

- **GIVEN** 需要實現 Sidebar 的展開/收合狀態
- **WHEN** 開發者建立 Zustand store 如 `useSidebarStore`
- **THEN** Store 管理 `isOpen` 布林值，Component 訂閱此狀態並無需使用 useState

#### Scenario: 禁止在 Zustand 存儲 API 資料

- **GIVEN** 頁面取得帳號列表
- **WHEN** 開發者考慮如何存儲此列表資料
- **THEN** 使用 React Query 快存管理，不應放在 Zustand（會造成複製和不同步）

### Requirement: Mantine v8 與 Tailwind 整合規範

系統前端 UI 元件 SHALL 使用 Mantine v8 的現代 API（禁止使用 v6 過時語法如 `createStyles`、`emotion`），Tailwind CSS 用於 RWD（Responsive Design）與複雜 Grid 佈局。

#### Scenario: Modal 使用 Mantine v8 API

- **GIVEN** 需要實現確認對話框
- **WHEN** 開發者使用 Modal 元件
- **THEN** 使用 `useDisclosure` 管理開關狀態，而非 v6 的 `createStyles`

#### Scenario: Tailwind 用於佈局響應

- **GIVEN** 頁面需要在手機和桌面上有不同佈局
- **WHEN** 開發者使用 Tailwind 工具類
- **THEN** 使用 `md:flex-row flex-col` 等響應式工具，Mantine 負責元件高階結構
