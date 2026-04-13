# Design: User Profile Page

## Architecture

### Frontend Structure

```
src/
  pages/
    ProfilePage.tsx              # 个人资料页面主组件
  components/
    ProfileSettingsMenu.tsx      # 设置菜单下拉组件
  hooks/
    queries/
      useLogout.ts              # 登出逻辑 Hook
```

### Route Addition

在 `src/router.tsx` 中添加：
```tsx
<Route path="/profile" element={<ProfilePage />} />
```

## UI Components

### 1. 底部导航栏更新

**BottomNavigation.tsx** - 在最右侧添加个人资料项：
- 图标：`User` 或 `UserRound` (lucide-react)
- 标签：`個人`
- 路径：`/profile`
- 样式：与其他导航项一致

### 2. ProfilePage 结构

```
┌─────────────────────────────────────┐
│                              ⋮ (設定) │  <- Header (仅设置菜单)
├─────────────────────────────────────┤
│                                     │
│                                     │
│        中間頁面（目前空白）          │  <- Content Area
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ 首頁 | 行事曆 | +紀錄 | 數據 | 個人 │  <- Bottom Nav
└─────────────────────────────────────┘
```

### 3. 顶部导航栏设计

- **仅显示**：右上角三点设置菜单图标（`MoreVertical` 或 `EllipsisVertical`）
- **无需返回按钮**：用户可从底部导航返回其他页面
- **样式**：简洁的头部，只有设置图标

### 4. 下拉菜单设计

点击设置图标时显示：
```
┌─────────────────────┐
│   設定選項1 (未来)  │ <- 灰色文本
│                     │
│   ...               │ <- 其他选项预留
│                     │
│   ─────────────────  │ <- 分隔线
│   登出  (红色文本)   │ <- 点击触发登出
└─────────────────────┘
```

**样式**：
- 背景：白色卡片，圆角，阴影
- 定位：固定在右上角下方
- 登出按钮：文字红色 (#EF4444)，点击时有缩放反馈

## Implementation Details

### 登出流程

1. 用户点击登出按钮
2. 调用 `useLogout()` Hook
3. Hook 清空本地认证状态（Zustand store 或 localStorage）
4. 调用后端登出 API（如果需要）
5. 清空 React Query 缓存
6. 重定向到登录页面 `/login`

### 样式一致性

- 使用 `ios-card` 类作为菜单背景
- 使用 `text-babo-text` 和 `text-babo-primary` 的颜色系统
- 按钮使用 `rounded-full` 或 `rounded-lg` 保持圆角
- 阴影使用 `shadow-md` 或 `shadow-lg`

## API Endpoints

- **登出**：`POST /api/auth/logout` (如有后端需求）
  - 身份认证：通过 JWT Token
  - 响应：成功时返回 200，清空 Token

## State Management

- 使用 Zustand 存储用户认证状态
- 使用 React Query 管理登出请求
- localStorage 存储 Token（可选）
