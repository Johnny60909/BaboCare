import { Users, Clock, Baby } from "lucide-react";
import { useNavigate } from "react-router";

/// <summary>
/// 後台管理首頁
/// 顯示待處理請求和寶寶總覽
/// </summary>
export const AdminDashboardPage = () => {
  const navigate = useNavigate();

  // 模擬數據 - 實際應從 API 獲取
  const pendingRequests = [
    {
      id: "1",
      name: "林大為 David",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jerry",
      source: "Google Login",
      status: "pending",
    },
    {
      id: "2",
      name: "陳小美 Mimi",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi",
      source: "LINE Login",
      status: "awaiting-code",
    },
  ];

  const babies = [
    {
      id: "1",
      name: "小圓圓",
      age: "8 個月大",
      gender: "男寶寶",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      carerName: "王阿姨 (保母)",
      status: "已啟用",
      member_count: 2,
    },
    {
      id: "2",
      name: "比比",
      age: "1 歲 2 個月",
      gender: "女寶寶",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
      carerName: "王阿姨 (保母)",
      status: "暫停中",
      member_count: 1,
    },
  ];

  return (
    <div className="min-h-screen bg-babo-bg pb-8">
      {/* 頭部 */}
      <header className="bg-white px-6 pt-6 pb-4 shadow-sm">
        <h1 className="text-2xl font-bold text-babo-text">管理後台</h1>
        <p className="text-sm text-babo-text-light">身分審核與資料維護</p>
      </header>

      <div className="px-6 py-6 space-y-8">
        {/* 待處理區 */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold text-babo-text">待處理請求</h2>
            <span className="text-babo-primary text-xs font-bold px-3 py-1 bg-blue-50 rounded-full">
              {pendingRequests.length} 位等待中
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="ios-card p-8 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-babo-text-light">暫無待處理請求</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="ios-card p-4 flex items-center gap-4 border-l-4 border-yellow-400"
                >
                  <img
                    src={request.avatar}
                    alt={request.name}
                    className="w-12 h-12 rounded-full bg-blue-50"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-base text-babo-text">
                      {request.name}
                    </p>
                    <p className="text-xs text-babo-text-light">
                      來源：{request.source}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/pending`)}
                    className="px-4 py-2 text-white text-xs font-bold rounded-full transition-colors active:scale-95"
                    style={{
                      backgroundColor: "#3B82F6",
                    }}
                  >
                    {request.status === "awaiting-code" ? "邀請碼" : "指派"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 寶寶總覽 */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-babo-text">寶寶總覽</h2>
            <button className="text-babo-primary text-sm font-bold hover:text-blue-600">
              + 新增寶寶
            </button>
          </div>

          {babies.length === 0 ? (
            <div className="ios-card p-8 text-center">
              <Baby className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-babo-text-light">暫無寶寶資料</p>
            </div>
          ) : (
            <div className="space-y-4">
              {babies.map((baby) => (
                <div
                  key={baby.id}
                  className={`ios-card p-5 transition-opacity ${
                    baby.status === "暫停中" ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={baby.avatar}
                      alt={baby.name}
                      className="w-14 h-14 rounded-2xl bg-gray-100"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-babo-text text-base">{baby.name}</p>
                      <p className="text-xs text-babo-text-light">
                        {baby.age} · {baby.gender}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-[10px] font-bold rounded ${
                        baby.status === "已啟用"
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {baby.status}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-babo-text-light">
                    <div className="flex items-center gap-2">
                      <Users size={14} />
                      <span>{baby.carerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} />
                      <span>{baby.member_count} 位成員</span>
                    </div>
                  </div>
                </div>
              ))}
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
              onClick={() => navigate("/admin/pending")}
              className="ios-card p-6 flex flex-col items-center gap-3 hover:shadow-lg active:scale-95 transition-all"
            >
              <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <span className="font-bold text-sm text-babo-text">待匹配</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
