import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./components/AdminLayout";
import { UserLayout } from "./components/UserLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { QuickRecordPage } from "./pages/QuickRecordPage";
import { RecordDetailPage } from "./pages/RecordDetailPage";
import { CalendarPage } from "./pages/CalendarPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminUserFormPage } from "./pages/admin/AdminUserFormPage";
import { AdminPendingPage } from "./pages/admin/AdminPendingPage";
import AdminBabiesPage from "./pages/admin/AdminBabiesPage";
import AdminBabyEditPage from "./pages/admin/AdminBabyEditPage";
import AdminBabyNewPage from "./pages/admin/AdminBabyNewPage";
import { PendingRegisterPage } from "./pages/PendingRegisterPage";
import { ActivatePage } from "./pages/ActivatePage";

const ADMIN_ROLES = ["SystemAdmin", "Nanny"];

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
          <Route path="/quick-record" element={<QuickRecordPage />} />
          <Route path="/record/:type" element={<RecordDetailPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* 後台 (SystemAdmin / Nanny) */}
      <Route element={<ProtectedRoute requiredRoles={ADMIN_ROLES} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/new" element={<AdminUserFormPage />} />
          <Route path="users/:id/edit" element={<AdminUserFormPage />} />
          <Route path="babies" element={<AdminBabiesPage />} />
          <Route path="babies/new" element={<AdminBabyNewPage />} />
          <Route path="babies/:babyId" element={<AdminBabyEditPage />} />
          <Route path="pending" element={<AdminPendingPage />} />
        </Route>
      </Route>

      {/* 預設導向首頁 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
