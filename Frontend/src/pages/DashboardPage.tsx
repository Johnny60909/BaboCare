import { Bell, MoreHorizontal } from "lucide-react";
import { useGetBabies } from "../hooks/queries/useBabies";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5181";
const getAvatarUrl = (url?: string | null, fallback?: string) => {
  if (!url) return fallback ?? "";
  return url.startsWith("http") ? url : `${API_URL}${url}`;
};

/// <summary>
/// 首頁 - 寶寶動態牆首頁
/// 顯示寶寶的各項記錄和活動動態
/// </summary>
export const DashboardPage = () => {
  const { data: babiesData = [] } = useGetBabies();

  // 將 API 數據轉換為展示格式
  const babies = babiesData.map((baby) => ({
    id: baby.id,
    name: baby.name,
    avatar: getAvatarUrl(
      baby.avatarUrl,
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${baby.id}`,
    ),
    status: "awake",
  }));

  const feeds = [
    {
      id: 1,
      carerName: "保母 王阿姨",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      time: "10:30 AM",
      type: "喝奶紀錄",
      icon: "🍼",
      amount: "180 ml",
      status: "配方奶",
      image:
        "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800",
      description:
        "今天胃口很好，一口氣就喝完了！喝完後拍嗝也很順利，目前精神愉快在玩健力架。",
    },
    {
      id: 2,
      carerName: "保母 王阿姨",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      time: "08:15 AM",
      type: "換尿布",
      icon: "💩",
      status1: "大便",
      status2: "質地正常",
      description: "換了乾淨的尿布，屁屁有擦護疹膏預防紅屁屁。",
    },
  ];

  return (
    <div className="min-h-screen bg-babo-bg pb-24">
      {/* 頭部 */}
      <header className="bg-white px-6 pt-6 pb-4 flex justify-between items-center shadow-sm">
        <h2 className="text-2xl font-bold text-babo-text">
          {babies.length > 0 ? `${babies[0].name}的日常` : "寶寶日常"}
        </h2>
        <button className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors">
          <Bell className="w-5 h-5 text-babo-primary" />
        </button>
      </header>

      {/* Stories 區 */}
      <div className="flex gap-4 px-6 py-4 overflow-x-auto no-scrollbar">
        {babies.map((baby) => (
          <div
            key={baby.id}
            className="flex flex-col items-center gap-1 min-w-[70px]"
          >
            <div
              className={`status-ring ${baby.status === "awake" ? "status-awake" : "status-sleep"}`}
            >
              <img
                src={baby.avatar}
                alt={baby.name}
                className="w-14 h-14 rounded-full bg-gray-200"
              />
            </div>
            <span className="text-xs font-medium text-babo-text">
              {baby.name}
            </span>
          </div>
        ))}
      </div>

      {/* Feed 列表 */}
      <div className="px-6 space-y-6">
        {feeds.map((feed) => (
          <div key={feed.id} className="ios-card overflow-hidden">
            {/* 頂部資訊 */}
            <div className="p-4 flex items-center gap-3 border-b border-gray-50">
              <img
                src={feed.avatar}
                alt={feed.carerName}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <p className="font-bold text-base text-babo-text">
                  {feed.carerName}
                </p>
                <p className="text-xs text-babo-text-light">
                  {feed.time} · {feed.type}
                </p>
              </div>
              <button className="text-babo-text-light hover:text-babo-text transition-colors">
                <MoreHorizontal size={18} />
              </button>
            </div>

            {/* 圖片（如果有） */}
            {feed.image && (
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={feed.image}
                  alt={feed.type}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* 內容 */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {feed.amount && (
                  <span className="px-3 py-1 bg-blue-50 text-babo-primary rounded-full text-xs font-bold">
                    {feed.icon} {feed.amount}
                  </span>
                )}
                {feed.status && (
                  <span className="px-3 py-1 bg-gray-50 text-babo-text-light rounded-full text-xs font-medium">
                    {feed.status}
                  </span>
                )}
                {feed.status1 && (
                  <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">
                    {feed.icon} {feed.status1}
                  </span>
                )}
                {feed.status2 && (
                  <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs font-bold">
                    {feed.status2}
                  </span>
                )}
              </div>
              <p className="text-sm text-babo-text leading-relaxed">
                {feed.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
