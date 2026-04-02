import { Navigate, Outlet } from 'react-router';
import { getToken } from '../lib/auth';
import { useUserRoles } from '../hooks/useUserRoles';

interface ProtectedRouteProps {
  requiredRoles?: string[];
}

export const ProtectedRoute = ({ requiredRoles }: ProtectedRouteProps) => {
  const token = getToken();
  const roles = useUserRoles();

  if (!token) return <Navigate to="/login" replace />;

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = requiredRoles.some((r) => roles.includes(r));
    if (!hasRole) return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
