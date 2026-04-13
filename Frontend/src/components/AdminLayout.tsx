import { NavLink, Outlet, useNavigate } from "react-router";
import { Users, Clock, Home } from "lucide-react";

const navItems = [
  { icon: Home, label: "管理首頁", path: "/admin" },
  { icon: Users, label: "帳號管理", path: "/admin/users" },
  { icon: Clock, label: "待匹配帳號", path: "/admin/pending" },
];

export const AdminLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-babo-bg">
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>

      {/* 下方導航 */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav z-50 h-20 flex items-center justify-around px-4 border-t border-gray-200">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/admin"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-2 px-3 text-xs transition-colors rounded-lg ${
                isActive
                  ? "text-babo-primary"
                  : "text-babo-text-light hover:text-babo-text"
              }`
            }
            title={label}
          >
            <Icon size={24} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => navigate("/")}
          className="flex flex-col items-center justify-center gap-1 py-2 px-3 text-xs text-babo-text-light hover:text-babo-text transition-colors rounded-lg"
          title="返回首頁"
        >
          <Home size={24} />
          <span className="text-[10px] font-medium">返回</span>
        </button>
      </nav>

      {/* 底部間距 */}
      <div className="h-20" />
    </div>
  );
};
