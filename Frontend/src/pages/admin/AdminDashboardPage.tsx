import { Bell, ChevronRight, Users, Baby } from "lucide-react";
import { useNavigate } from "react-router";
import { useAdminStats } from "../../hooks/queries/Admin/useAdminStats";
import { usePendingUsers } from "../../hooks/queries/PendingUsers/usePendingUsers";

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: pendingUsers = [], isLoading: pendingLoading } =
    usePendingUsers();

  return (
    <div className="min-h-screen bg-[#F8F9FA] px-6 pt-12 pb-28 text-left">
      {/* 頭部 */}
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">管理中心</h2>
          <p className="text-gray-500 text-sm">數據概覽與通知</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
          <Bell size={18} className="text-gray-400" />
        </div>
      </header>

      {/* 統計卡片 */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-50 rounded-[32px] p-5">
          <div className="flex justify-between items-center mb-2">
            <Users size={14} className="text-blue-500" />
            <span className="text-[10px] font-bold text-blue-400">帳號</span>
          </div>
          <p className="text-2xl font-bold">
            {statsLoading ? "—" : (stats?.totalUsers ?? 0)}
          </p>
          <p className="text-[10px] text-blue-600/60 font-medium">總用戶</p>
        </div>
        <div className="bg-green-50 rounded-[32px] p-5">
          <div className="flex justify-between items-center mb-2">
            <Baby size={14} className="text-green-500" />
            <span className="text-[10px] font-bold text-green-400">寶寶</span>
          </div>
          <p className="text-2xl font-bold">
            {statsLoading ? "—" : (stats?.totalBabies ?? 0)}
          </p>
          <p className="text-[10px] text-green-600/60 font-medium">在托寶寶</p>
        </div>
      </div>

      {/* 待處理任務 */}
      <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">
        待處理任務
      </h3>
      <div className="space-y-3">
        {pendingLoading ? (
          <div className="ios-card p-5 text-center text-sm text-gray-400">
            載入中…
          </div>
        ) : (
          <div
            onClick={() => navigate("/admin/pending")}
            className="ios-card p-5 flex items-center gap-4 cursor-pointer active:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 flex-shrink-0">
              <Users size={20} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">新帳號審核</p>
              <p className="text-xs text-gray-400">
                {pendingUsers.length > 0
                  ? `目前有 ${pendingUsers.length} 筆待處理`
                  : "目前無待處理項目"}
              </p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </div>
        )}
      </div>
    </div>
  );
};
