# Tasks: Add User Profile Page

## Implementation Checklist

### 1. Frontend - Navigation Update

- [x] **更新 BottomNavigation 组件**
  - 在 `src/components/BottomNavigation.tsx` 中导入 `User` 图标
  - 在 `navItems` 数组的最后添加个人资料项
  - 路径设为 `/profile`
  - 标签设为「個人」
  
### 2. Frontend - 路由配置

- [x] **添加 Profile 路由**
  - 在 `src/router.tsx` 中导入 `ProfilePage`
  - 添加路由配置：`<Route path="/profile" element={<ProfilePage />} />`
  - 确保路由在 `UserLayout` 或适当的 Layout 包裹内

### 3. Frontend - Profile 页面创建

- [x] **创建 ProfilePage 组件**
  - 文件路径：`src/pages/ProfilePage.tsx`
  - 仅包含右上角设置菜单图标（无返回按钮、无页面标题）
  - 包含空白的中间内容区域
  - 集成 `ProfileSettingsMenu` 组件
  - 底部导航栏：使用 `BottomNavigation` 组件（保持高度一致 pb-24）

### 4. Frontend - 设置菜单组件

- [x] **创建 ProfileSettingsMenu 组件**
  - 文件路径：`src/components/ProfileSettingsMenu.tsx`
  - 使用 `useDisclosure` 或 state 管理菜单开关
  - 点击设置图标时显示/隐藏菜单
  - 菜单内容：登出按钮（红色）
  - 使用 `Popover` 或自定义 Dropdown 实现
  - 点击菜单外自动关闭

### 5. Frontend - 登出逻辑

- [x] **创建 useLogout Hook**
  - 文件路径：`src/hooks/queries/useLogout.ts`
  - 使用 `useMutation` 包裹登出请求
  - 实现步骤：
    1. 调用后端登出 API（或直接清除前端状态）
    2. 清空本地 Token（localStorage / sessionStorage）
    3. 清除认证相关的 Zustand 状态
    4. 清空 React Query 缓存
    5. 重定向到 `/login`

- [x] **更新认证状态管理**
  - 确保登出时清空用户信息
  - 确保重新加载页面时检查 Token 有效性

### 6. Frontend - 样式统一

- [x] **应用统一的 iOS 风格**
  - 顶部导航栏：`bg-white px-6 pt-6 pb-4 shadow-sm`
  - 设置菜单：`ios-card` 背景、`shadow-md`
  - 按钮：`rounded-full` 或 `rounded-lg`
  - 登出按钮文字：`text-red-500` 或 `text-red-600`
  - 字体大小：遵循已有的字体缩放规则

### 7. Frontend - 测试

- [x] **功能测试**
  - 确认导航栏显示个人资料图标
  - 确认点击图标进入 `/profile` 页面
  - 确认设置图标可以打开/关闭菜单
  - 确认登出按钮点击后成功登出
  - 确认登出后重定向到登录页

### 8. Frontend - 代码优化

- [x] **代码审查**
  - 检查组件是否严格遵循 MVVM 模式（View 和 Logic 分离）
  - 检查 TypeScript 类型定义是否完整
  - 检查是否有未使用的导入
  - 验证构建是否成功：`npm run build`

## Testing Checklist

- [x] 导航栏显示新图标
- [x] 图标点击进入 Profile 页面
- [x] 设置图标点击显示菜单
- [x] 登出按钮可见且为红色
- [x] 登出成功后清除认证
- [x] 登出后重定向到登录页
- [x] 页面响应式设计检查
- [x] 风格一致性检查

## Build & Deploy

- [x] 执行 `npm run build` 验证代码编译无错
- [x] 执行 `npm run dev` 本地测试
- [x] 确认没有控制台错误
