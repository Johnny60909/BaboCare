import { Navigate, Outlet } from 'react-router';
import { getToken } from '../lib/auth';

/// <summary>
/// 受保護路由 - 需要認證才能訪問
/// </summary>
export const ProtectedRoute = () => {
  const token = getToken();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};
