import { NavLink, Outlet, useNavigate, useLocation } from "react-router";
import { PieChart, Users, Baby, UserCheck, LogOut } from "lucide-react";
import { usePendingUsers } from "../hooks/queries/PendingUsers/usePendingUsers";

const navItems = [
  { icon: PieChart, label: "管理首頁", path: "/admin", badge: false },
  { icon: Users, label: "帳號管理", path: "/admin/users", badge: false },
  { icon: Baby, label: "寶寶管理", path: "/admin/babies", badge: false },
  { icon: UserCheck, label: "待審核", path: "/admin/pending", badge: true },
];

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: pendingUsers = [] } = usePendingUsers();
  const hasPending = pendingUsers.length > 0;

  // 檢測是否在編輯/新增頁面
  const isEditPage =
    location.pathname.includes("/users/new") ||
    location.pathname.includes("/users/") ||
    location.pathname.includes("/babies/new") ||
    location.pathname.includes("/babies/");

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <main className="flex-1 overflow-y-auto text-left">
        <Outlet />
      </main>

      {/* 下方導航 (編輯/新增頁面隱藏) */}
      {!isEditPage && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-[16px] border-t border-gray-200 z-50 h-[100px] flex items-center justify-around px-4 pb-4">
          {navItems.map(({ icon: Icon, label, path, badge }) => (
            <NavLink key={path} to={path} end={path === "/admin"}>
              {({ isActive }) => (
                <div
                  className={`relative flex flex-col items-center justify-center gap-1.5 p-2 transition-all rounded-[20px] ${
                    isActive ? "text-blue-600 bg-blue-50" : "text-gray-400"
                  }`}
                >
                  <Icon size={22} />
                  {badge && hasPending && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                  )}
                  <span className="text-[9px] font-bold">{label}</span>
                </div>
              )}
            </NavLink>
          ))}
          <div className="w-[1px] h-6 bg-gray-200 mx-1" />
          <button
            onClick={() => navigate("/")}
            className="flex flex-col items-center justify-center gap-1.5 p-2 text-gray-400"
            title="返回"
          >
            <LogOut size={22} />
            <span className="text-[9px] font-bold">返回</span>
          </button>
        </nav>
      )}

      {/* 底部間距 (編輯/新增頁面隱藏) */}
      {!isEditPage && <div className="h-[100px]" />}
    </div>
  );
};
