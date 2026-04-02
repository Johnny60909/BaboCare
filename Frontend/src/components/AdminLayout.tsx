import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { Users, Clock, Home, ChevronLeft, ChevronRight } from 'lucide-react';

const navItems = [
  { icon: Users, label: '帳號管理', path: '/admin/users' },
  { icon: Clock, label: '待匹配帳號', path: '/admin/pending' },
];

export const AdminLayout = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside
        className={`shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col transition-all duration-200 ${
          collapsed ? 'w-14' : 'w-52'
        }`}
      >
        {/* Header + toggle */}
        <div className="flex items-center justify-between pt-4 px-2 mb-1">
          {!collapsed && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
              後台管理
            </p>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="ml-auto rounded-md p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
            title={collapsed ? '展開選單' : '收合選單'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 px-2 flex-1">
          {navItems.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        {/* 返回首頁 */}
        <div className="px-2 pb-4">
          <button
            onClick={() => navigate('/')}
            title={collapsed ? '返回首頁' : undefined}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <Home size={16} className="shrink-0" />
            {!collapsed && '返回首頁'}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};
