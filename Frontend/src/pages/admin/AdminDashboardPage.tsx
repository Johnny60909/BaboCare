import { Users, Clock, Baby, ChevronRight, UserCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { useAdminStats } from "../../hooks/queries/Admin/useAdminStats";
import { usePendingUsers } from "../../hooks/queries/PendingUsers/usePendingUsers";

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: pendingUsers = [], isLoading: pendingLoading } =
    usePendingUsers();

  return (
    <div className="min-h-screen bg-babo-bg pb-24">
      {/* 頭部 */}
      <header className="bg-white px-6 pt-6 pb-4 shadow-sm">
        <h1 className="text-2xl font-bold text-babo-text">管理後台</h1>
        <p className="text-sm text-babo-text-light">身分審核與資料維護</p>
      </header>

      <div className="px-6 py-6 space-y-8">
        {/* 統計數字卡片 */}
        <section>
          <h2 className="text-lg font-bold text-babo-text mb-4">系統總覽</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="ios-card p-5 flex flex-col gap-2">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <Users size={20} className="text-babo-primary" />
              </div>
              <p className="text-2xl font-bold text-babo-text">
                {statsLoading ? "—" : (stats?.totalUsers ?? 0)}
              </p>
              <p className="text-xs text-babo-text-light">帳號總數</p>
            </div>
            <div className="ios-card p-5 flex flex-col gap-2">
              <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center">
                <Baby size={20} className="text-pink-400" />
              </div>
              <p className="text-2xl font-bold text-babo-text">
                {statsLoading ? "—" : (stats?.totalBabies ?? 0)}
              </p>
              <p className="text-xs text-babo-text-light">寶寶總數</p>
            </div>
          </div>
        </section>

        {/* 待處理任務 */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-babo-text">待處理申請</h2>
            {!pendingLoading && pendingUsers.length > 0 && (
              <span className="text-babo-primary text-xs font-bold px-3 py-1 bg-blue-50 rounded-full">
                {pendingUsers.length} 位等待中
              </span>
            )}
          </div>

          {pendingLoading ? (
            <div className="ios-card p-6 text-center text-babo-text-light text-sm">
              載入中…
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="ios-card p-8 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-babo-text-light">暫無待處理請求</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.slice(0, 3).map((user) => (
                <div
                  key={user.id}
                  className="ios-card p-4 flex items-center gap-4 border-l-4 border-yellow-400"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                    {(user.displayName || user.email || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-babo-text truncate">
                      {user.displayName || user.email || "未命名"}
                    </p>
                    <p className="text-xs text-babo-text-light">
                      來源：{user.source}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/admin/pending")}
                    className="px-3 py-1.5 bg-babo-primary text-white text-xs font-bold rounded-full active:scale-95 transition-all whitespace-nowrap"
                  >
                    審核
                  </button>
                </div>
              ))}
              {pendingUsers.length > 3 && (
                <button
                  onClick={() => navigate("/admin/pending")}
                  className="ios-card p-3 w-full text-center text-babo-primary text-sm font-medium flex items-center justify-center gap-1"
                >
                  查看全部 {pendingUsers.length} 位申請
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}
        </section>

        {/* 快速操作 */}
        <section>
          <h2 className="text-lg font-bold text-babo-text mb-4">快速操作</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/admin/users")}
              className="ios-card p-6 flex flex-col items-center gap-3 hover:shadow-lg active:scale-95 transition-all"
            >
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-babo-primary" />
              </div>
              <span className="font-bold text-sm text-babo-text">帳號管理</span>
            </button>

            <button
              onClick={() => navigate("/admin/babies")}
              className="ios-card p-6 flex flex-col items-center gap-3 hover:shadow-lg active:scale-95 transition-all"
            >
              <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center">
                <Baby className="w-6 h-6 text-pink-400" />
              </div>
              <span className="font-bold text-sm text-babo-text">寶寶管理</span>
            </button>

            <button
              onClick={() => navigate("/admin/pending")}
              className="ios-card p-6 flex flex-col items-center gap-3 hover:shadow-lg active:scale-95 transition-all"
            >
              <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <span className="font-bold text-sm text-babo-text">
                待匹配申請
              </span>
            </button>

            <button
              onClick={() => navigate("/admin/babies/new")}
              className="ios-card p-6 flex flex-col items-center gap-3 hover:shadow-lg active:scale-95 transition-all"
            >
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-500" />
              </div>
              <span className="font-bold text-sm text-babo-text">新增寶寶</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
