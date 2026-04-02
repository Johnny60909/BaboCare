import { useNavigate, useLocation } from 'react-router';
import { Home, Settings } from 'lucide-react';
import { useUserRoles } from '../hooks/useUserRoles';

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const roles = useUserRoles();
  const isAdmin = roles.some((r) => r === 'SystemAdmin' || r === 'Nanny');

  const items = [
    { icon: Home, label: '首頁', path: '/' },
    ...(isAdmin ? [{ icon: Settings, label: '後台管理', path: '/admin' }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex">
        {items.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-1 flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors ${
                active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
