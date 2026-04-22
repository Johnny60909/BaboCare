# frontend-architecture Specification

## Purpose

TBD - created by archiving change audit-and-align-architecture-docs. Update Purpose after archive.

## Requirements

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

### Requirement: API 客戶端與統一響應協議 (apiClient.ts)

系統前端 SHALL 使用 `src/lib/apiClient.ts` 作為中央 HTTP 客戶端，實現 Bearer Token 管理、響應攔截、自動 Token 刷新，並與後端的 `JsonResponse<T>` 協議整合。

#### Client Configuration

`apiClient.ts` 必須包含以下組件：

1. **ResponseStateEnum** - 與後端一致的響應狀態碼定義
2. **JsonResponse<T>** 和 **JsonTableResponse<T>** - 類型定義（支援前端類型檢查）
3. **handleApiResponse<T>(response)** - 統一響應處理函式，根據 state 值進行分流
4. **Request 攔截器** - 自動添加 Bearer Token 標頭
5. **Response 攔截器** - 處理 401 錯誤、自動使用 refresh_token 重新申請 access_token

#### Implementation Details

```typescript
// src/lib/apiClient.ts
export enum ResponseStateEnum {
  Success = 111,
  NotFound = 493,
  NoPermission = 495,
  Error = 999,
}

export interface JsonResponse<T = any> {
  state: ResponseStateEnum;
  message: string | null;
  result: T;
}

export interface JsonTableResponse<T = any> extends JsonResponse<T[]> {
  total: number;
}

export const handleApiResponse = <T>(
  response: AxiosResponse<JsonResponse<T>>,
): T => {
  const { state, message, result } = response.data;

  switch (state) {
    case ResponseStateEnum.Success:
      return result;
    case ResponseStateEnum.NotFound:
      console.warn(message || "Resource Not Found");
      return null as T;
    case ResponseStateEnum.NoPermission:
      window.location.href = "/";
      throw new Error("No Permission");
    case ResponseStateEnum.Error:
    default:
      throw new Error(message || "API Error");
  }
};
```

#### Service Integration Pattern

每個 Service 必須遵循以下模式：

```typescript
// src/api/services/Babies/babyService.ts
import apiClient, {
  handleApiResponse,
  type JsonResponse,
} from "../../../lib/apiClient";

export const babyService = {
  async getBabies(signal?: AbortSignal): Promise<IBaby[]> {
    const response = await apiClient.get<JsonResponse<IBaby[]>>("/api/babies", {
      signal,
    });
    return handleApiResponse(response);
  },

  async createBaby(request: ICreateBabyRequest): Promise<IBaby> {
    const response = await apiClient.post<JsonResponse<IBaby>>(
      "/api/babies",
      request,
    );
    return handleApiResponse(response);
  },
};
```

#### Scenario: Service 正確使用 apiClient

- **GIVEN** 需要建立帳號管理 Service
- **WHEN** 開發者在 Service 中呼叫 apiClient
- **THEN** Service 使用 `apiClient.get/post/put/delete<JsonResponse<DTO>>`，並通過 `handleApiResponse` 轉換響應

#### Scenario: 自動 Token 刷新

- **GIVEN** API 請求返回 401 Unauthorized
- **WHEN** Response 攔截器檢測到 401 狀態
- **THEN** 攔截器自動使用 refresh_token 申請新 access_token，並重試原請求

#### Scenario: 無權限重定向

- **GIVEN** API 返回 JsonResponse { state: 495, message: "No Permission" }
- **WHEN** `handleApiResponse` 處理此響應
- **THEN** 自動重定向至首頁 (`/`)，並清除相關授權狀態

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

系統前端提供個人資料中心頁面，作為使用者快速訪問個人設定和登出功能的入口。該功能 SHALL 遵循 iOS 風格設計，並與現有導航架構保持一致。

### Requirement: 個人資料中心頁面

系統前端 SHALL 提供個人資料中心頁面（`/profile`），並在底部導航欄新增個人圖標。該頁面 SHALL 包含頂部設定菜單、登出選項，並為後續功能（如帳號設定、個人訊息編輯）預留空間。

#### Page: ProfilePage

**Location**: `src/pages/ProfilePage.tsx`

**Purpose**: 提供使用者訪問個人設定和登出功能

**Components & Hooks Used**:

- `ProfileSettingsMenu` - 頂部設定選單（點擊顯示/隱藏下拉菜單）
- `useLogout()` - 登出 Mutation Hook
- `BottomNavigation` - 底部導航欄

**Layout Structure**:

- 頂部導航欄：只顯示設定圖標（⋮），無返回按鈕、無頁面標題
- 中間內容區域：空白佔位，用於未來擴展
- 底部導航欄：固定高度（pb-20），與其他頁面保持一致

#### Component: ProfileSettingsMenu

**Location**: `src/components/ProfileSettingsMenu.tsx`

**Purpose**: 個人資料設定下拉菜單，包含登出選項

**Feature Requirements**:

- 三點圖標（⋮）按鈕打開/關閉菜單
- 菜單使用 iOS 卡片風格（`rounded-[20px]`、`shadow-lg shadow-black/10`）
- 菜單項：紅色登出按鈕（`text-red-600`）
- 點擊菜單外自動關閉
- 使用 `useLogout()` Hook 處理登出邏輯

**Props**:

```typescript
interface ProfileSettingsMenuProps {
  settingsMenuRef: RefObject<HTMLDivElement | null>;
}
```

#### Scenario: 使用者點擊個人圖標進入個人資料頁面

- **GIVEN** 使用者已登入並在首頁
- **WHEN** 點擊底部導航欄右側的「個人」圖標
- **THEN** 進入 `/profile` 路由，顯示個人資料頁面

#### Scenario: 使用者從個人資料頁面登出

- **GIVEN** 使用者在 `/profile` 頁面
- **WHEN** 點擊右上角設定圖標（⋮），然後點擊紅色「登出」選項
- **THEN** `useLogout()` Hook 執行：清除 Token、清除 React Query 快取、重定向至 `/login`

#### Scenario: 設定菜單自動關閉

- **GIVEN** 個人資料頁面設定菜單已開啟
- **WHEN** 點擊菜單外的任何位置
- **THEN** 菜單自動關閉

### Requirement: 底部導航新增個人圖標

系統前端底部導航欄 SHALL 新增「個人」圖標項目，位於導航欄最右側（在「管理」項之後），點擊時進入 `/profile` 路由。

#### Modification: BottomNavigation 元件

**File**: `src/components/BottomNavigation.tsx`

**Changes**:

- 導入 `User` 圖標（來自 lucide-react）
- 在 `navItems` 陣列新增個人資料項目
  - 圖標: `User`
  - 標籤: 「個人」
  - 路由: `/profile`
  - 位置: 導航欄最右側
- 樣式與其他導航項保持一致

#### Scenario: 導航欄顯示新個人圖標

- **GIVEN** 前端應用已載入
- **WHEN** 檢查底部導航欄
- **THEN** 顯示「個人」圖標，位於導航欄最右側，與其他圖標樣式保持一致

### Requirement: 路由配置更新

系統前端路由配置 SHALL 新增 `/profile` 路由，使用 `ProtectedRoute` 保護，確保只有已登入使用者可訪問。

#### Modification: 路由配置（router.tsx）

**File**: `src/router.tsx`

**Changes**:

- 導入 `ProfilePage` 組件
- 在 `UserLayout` 內新增 `/profile` 路由
- 確保受 `ProtectedRoute` 保護

#### Scenario: 登入使用者訪問個人資料頁面

- **GIVEN** 使用者已登入
- **WHEN** 導航至 `/profile`
- **THEN** `ProtectedRoute` 允許訪問，載入 `ProfilePage`

#### Scenario: 未登入使用者訪問個人資料頁面

- **GIVEN** 使用者未登入
- **WHEN** 嘗試導航至 `/profile`
- **THEN** `ProtectedRoute` 攔截，重定向至 `/login`

### Requirement: 登出 Hook 實現

系統前端 SHALL 實現 `useLogout()` Custom Hook，用於封裝登出邏輯，包括清除認證狀態、清除快取、重定向至登入頁。

#### Custom Hook: useLogout

**Location**: `src/hooks/queries/useLogout.ts`

**Type**: React Query `useMutation`

**Functionality**:

1. 清除本地 Token（使用 `clearTokens()` 函式）
2. 清除 React Query 快取（`queryClient.clear()`）
3. 成功時重定向至 `/login` 且 `replace: true`
4. 發生錯誤時仍重定向至 `/login`，確保使用者退出

**Export**: 在 `src/hooks/queries/index.ts` 新增導出

#### Scenario: 使用者成功登出

- **GIVEN** 使用者點擊登出按鈕
- **WHEN** `useLogout()` Mutation 執行
- **THEN** Token 被清除、快取被清除、頁面重定向至 `/login`

#### Scenario: 登出過程中發生錯誤

- **GIVEN** 登出過程中出現 API 或其他錯誤
- **WHEN** Mutation 進入 `onError` 狀態
- **THEN** 即使出錯，仍重定向至 `/login`，確保使用者退出

### Requirement: iOS 設計風格一致性

系統前端個人資料頁面及其組件 SHALL 遵循統一的 iOS 設計風格，與現有前端設計保持一致。

#### Styling Requirements

- **卡片風格**: 元件使用 `ios-card` 類別、`rounded-[20px]` 或 `rounded-[32px]`
- **玻璃態效果**: 導航欄使用 `glass-nav` 類別
- **顏色方案**:
  - 主要互動: `text-babo-primary` / `#3B82F6`
  - 危險操作（登出）: `text-red-600`
  - 背景懸停: `hover:bg-red-50` / `hover:bg-gray-50`
- **陰影效果**: `shadow-lg shadow-black/5` 至 `shadow-lg shadow-black/10`
- **字體**: 遵循全局 `html { font-size: 18px; }` 設置
- **邊框圓角**: 按鈕使用 `rounded-full` 或 `rounded-lg`

#### Scenario: 個人資料頁面風格檢查

- **GIVEN** 個人資料頁面已載入
- **WHEN** 檢查頁面元素樣式
- **THEN** 所有元件（設定菜單、按鈕、邊框）都遵循 iOS 風格規範，與前台保持一致

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
