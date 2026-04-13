# Delta Spec: User Profile Page Addition

## New Pages & Components

### Addition: 個人資料頁面架構

系統前端 SHALL 新增個人資料中心頁面與相關組件，以提供用戶快速訪問個人設定和登出功能的入口。

#### Page: `/profile` - ProfilePage

**Location**: `src/pages/ProfilePage.tsx`

**Purpose**: 個人資料中心頁面，提供用戶訪問個人設定和登出功能

**Components Used**:
- `ProfileSettingsMenu` - 頂部設定選單
- `BottomNavigation` - 底部導航欄（內部使用）

**Layout Structure**:
```
┌─────────────────────────────────┐
│  頁面標題        ⋮ (設定圖標)   │ ← 頂部欄（bg-white、px-6、py-4）
├─────────────────────────────────┤
│                                 │
│                                 │
│    空白內容區域                 │ ← 為未來功能擴展預留
│    （佈局規劃中）               │
│                                 │
├─────────────────────────────────┤
│  Home  Calendar  +  Data  User  │ ← 底部導航（固定高度 pb-20）
└─────────────────────────────────┘
```

**Key Requirements**:
- 頁面頭部僅顯示設定圖標（⋮），無返回按鈕、無頁面標題
- 中間內容區域為空白佔位，用於後續功能（如帳號設定、個人信息編輯等）
- 底部導航栏固定，高度與其他頁面保持一致（pb-20）

#### Component: ProfileSettingsMenu

**Location**: `src/components/ProfileSettingsMenu.tsx`

**Purpose**: 頂部設定選單，包含登出選項

**Props**:
```typescript
interface ProfileSettingsMenuProps {
  settingsMenuRef: RefObject<HTMLDivElement | null>;
}
```

**Features**:
- 三點圖標（⋮）按鈕，點擊時開啟/關閉下拉菜單
- 菜單樣式: iOS卡片風格（`rounded-[20px]`、`shadow-lg shadow-black/10`）
- 菜單項: 紅色登出按鈕（`text-red-600`）
- 點擊菜單外自動關閉
- 使用 `useLogout` Hook 處理登出邏輯

**Styling Compliance**:
- 使用 iOS 卡片風格（`ios-card` / `rounded-[20px]`）
- 陰影: `shadow-lg shadow-black/10`
- 邊框半徑: `rounded-[20px]`
- 按鈕動畫: `hover:bg-red-50` transition

### Modification: BottomNavigation 導航項新增

**File**: `src/components/BottomNavigation.tsx`

**Changes**:
- 新增「個人」導航項（User 圖標），路由至 `/profile`
- 位置: 導航欄最右側（在「管理」按鈕之後）
- 圖標: `User` 來自 lucide-react
- 標籤: 「個人」
- 樣式: 與其他導航項保持一致（text-xs、icon size 24）

### Modification: 路由配置

**File**: `src/router.tsx`

**Changes**:
- 新增路由: `<Route path="/profile" element={<ProfilePage />} />`
- 位置: 在 `UserLayout` 內部，與其他使用者功能頁面（如 Dashboard、Calendar）同層
- 保護: 受 `ProtectedRoute` 保護（登入使用者可訪問）

## Custom Hooks

### New Hook: useLogout

**Location**: `src/hooks/queries/useLogout.ts`

**Purpose**: 封裝登出邏輯，包括清除認證狀態、快取和重定向

**Type**: `useMutation`

**Functionality**:
1. 清除本地 Token（使用 `clearTokens()` 函式）
2. 清除 React Query 快取（`queryClient.clear()`）
3. 成功時重定向至 `/login`（`navigate('/login', { replace: true })`）
4. 錯誤時仍重定向至 `/login`，確保使用者退出

**Usage Example**:
```typescript
const { mutate: logout } = useLogout();
logout(); // 觸發登出
```

### Export: 更新 Hooks 索引

**File**: `src/hooks/queries/index.ts`

**Changes**:
- 新增導出: `export * from './useLogout';`
- 與其他 Query Hooks（useAuth、useAdminUsers）同列

## Type Safety & DTO

無新增 DTO 需求（個人資料頁面為前端展示層，暫無新增 API 呼叫）

## Styling Compliance

所有新增元件 SHALL 遵循：
- **iOS 卡片風格**: `ios-card` 類別、`rounded-[20px]` / `rounded-[32px]`
- **玻璃態導航**: `glass-nav` 效果
- **顏色方案**: 
  - 主要操作: `text-babo-primary` / `#3B82F6`
  - 危險操作（登出）: `text-red-600`
  - 背景懸停: `hover:bg-red-50`
- **字體縮放**: 遵循全局 `html { font-size: 18px; }` 設置
- **陰影效果**: `shadow-lg shadow-black/5` 至 `shadow-lg shadow-black/10`

## Testing Considerations

Delta spec 已完成實現後應驗證：
- ✓ 導航欄顯示「個人」圖標
- ✓ 點擊進入 `/profile` 路由
- ✓ 設定圖標點擊開啟選單
- ✓ 登出按鈕文字為紅色
- ✓ 點擊登出重定向至 `/login`
- ✓ Token 清除、快取清除成功
- ✓ 編譯無錯誤 (`npm run build` ✓)

## Notes

該變更不涉及後端 API 新增（使用現有登出邏輯）。未來 ProfilePage 可擴展為：
- 個人信息顯示（名稱、頭像、帳號等）
- 帳號設定（密碼修改、雙因素驗證等）
- 通知偏好設置
