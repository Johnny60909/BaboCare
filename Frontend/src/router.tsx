import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/AdminLayout';
import { UserLayout } from './components/UserLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminUserFormPage } from './pages/admin/AdminUserFormPage';
import { AdminPendingPage } from './pages/admin/AdminPendingPage';
import { PendingRegisterPage } from './pages/PendingRegisterPage';
import { ActivatePage } from './pages/ActivatePage';

const ADMIN_ROLES = ['SystemAdmin', 'Nanny'];

/// <summary>
/// 應用路由配置
/// </summary>
export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<PendingRegisterPage />} />
      <Route path="/activate" element={<ActivatePage />} />

      {/* 一般登入使用者 */}
      <Route element={<ProtectedRoute />}>
        <Route element={<UserLayout />}>
          <Route path="/" element={<DashboardPage />} />
        </Route>
      </Route>

      {/* 後台 (SystemAdmin / Nanny) */}
      <Route element={<ProtectedRoute requiredRoles={ADMIN_ROLES} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/users" replace />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/new" element={<AdminUserFormPage />} />
          <Route path="users/:id/edit" element={<AdminUserFormPage />} />
          <Route path="pending" element={<AdminPendingPage />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);
