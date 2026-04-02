import { getToken } from '../lib/auth';

interface JwtPayload {
  role?: string | string[];
  [key: string]: unknown;
}

function parseJwt(token: string): JwtPayload | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export const useUserRoles = (): string[] => {
  const token = getToken();
  if (!token) return [];
  const payload = parseJwt(token);
  if (!payload) return [];
  const role = payload['role'] ?? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  if (!role) return [];
  return Array.isArray(role) ? role : [String(role)];
};
