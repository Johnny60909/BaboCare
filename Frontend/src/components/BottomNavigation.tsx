import { useNavigate, useLocation } from "react-router";
import { Home, Calendar, Plus, BarChart3, User } from "lucide-react";
import { useUserRoles } from "../hooks/useUserRoles";

/// <summary>
/// 底部導覽列 - iOS 風格玻璃態導覽
/// </summary>
export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const roles = useUserRoles();
  const isAdmin = roles.some((r) => r === "SystemAdmin" || r === "Nanny");

  const items = [
    { icon: Home, label: "首頁", path: "/", isCentered: false },
    { icon: Calendar, label: "行事曆", path: "/calendar", isCentered: false },
    ...(isAdmin
      ? [
          {
            icon: Plus,
            label: "新增動態",
            path: "/activity/new",
            isCentered: true,
          },
        ]
      : []),
    { icon: BarChart3, label: "數據", path: "/analytics", isCentered: false },
    { icon: User, label: "個人", path: "/profile", isCentered: false },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-nav z-50 h-20 flex items-center justify-around px-4">
      {items.map(({ icon: Icon, label, path, isCentered }) => {
        const isActive =
          location.pathname === path ||
          (path !== "/" && location.pathname.startsWith(path));

        if (isCentered) {
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 hover:shadow-xl active:scale-95 transition-all transform -mt-8 border-4 border-white"
              style={{ backgroundColor: "#3B82F6" }}
              title="快速紀錄"
            >
              <Icon size={24} strokeWidth={2} />
            </button>
          );
        }

        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-3 text-xs transition-colors rounded-lg ${
              isActive
                ? "text-babo-primary"
                : "text-babo-text-light hover:text-babo-text"
            }`}
            title={label}
          >
            <Icon size={24} strokeWidth={isActive ? 2.2 : 2} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
};
