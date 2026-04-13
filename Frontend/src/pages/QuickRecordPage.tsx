import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

/// <summary>
/// 快速紀錄功能中心頁面
/// 提供各類快速記錄選項（餵奶、尿布、睡眠、心情、副食品、醫療）
/// </summary>
export const QuickRecordPage = () => {
  const navigate = useNavigate();

  const recordTypes = [
    { id: 'feed', icon: '🍼', label: '餵奶', bgColor: 'bg-blue-50', textColor: 'text-blue-600', accentColor: '#3B82F6' },
    { id: 'diaper', icon: '💩', label: '尿布', bgColor: 'bg-green-50', textColor: 'text-green-600', accentColor: '#A7D397' },
    { id: 'sleep', icon: '🌙', label: '睡眠', bgColor: 'bg-purple-50', textColor: 'text-purple-600', accentColor: '#A084E8' },
    { id: 'mood', icon: '😊', label: '心情', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600', accentColor: '#FBBF24' },
    { id: 'food', icon: '🍎', label: '副食品', bgColor: 'bg-orange-50', textColor: 'text-orange-600', accentColor: '#F97316' },
    { id: 'medical', icon: '💊', label: '醫療', bgColor: 'bg-red-50', textColor: 'text-red-600', accentColor: '#EF4444' },
  ];

  const handleRecordClick = (type: string) => {
    // 導向到具體的記錄詩詳情頁面
    navigate(`/record/${type}`);
  };

  return (
    <div className="min-h-screen bg-babo-bg pb-24">
      {/* 頭部 */}
      <header className="bg-white px-6 pt-6 pb-4 flex items-center gap-4 shadow-sm">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-babo-text" />
        </button>
        <h2 className="text-2xl font-bold text-babo-text">快速紀錄</h2>
      </header>

      {/* 寶寶選擇器 */}
      <div className="px-6 py-6">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-full overflow-hidden">
          <button className="flex-1 py-3 bg-white shadow-sm rounded-full text-sm font-bold text-babo-text transition-all">
            小圓圓
          </button>
          <button className="flex-1 py-3 text-babo-text-light text-sm font-medium hover:text-babo-text transition-colors">
            比比
          </button>
        </div>
      </div>

      {/* 記錄類型網格 */}
      <div className="px-6 grid grid-cols-2 gap-4">
        {recordTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleRecordClick(type.id)}
            className={`ios-card p-6 flex flex-col items-center justify-center gap-3 ${type.bgColor} hover:shadow-lg active:scale-95 transition-all`}
          >
            <div
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm"
              style={{ border: `2px solid ${type.accentColor}20` }}
            >
              <span className="text-3xl">{type.icon}</span>
            </div>
            <span className={`font-bold text-sm ${type.textColor}`}>{type.label}</span>
          </button>
        ))}
      </div>

      {/* 底部提示 */}
      <div className="px-6 mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
        <p className="text-xs text-blue-600 text-center">
          選擇要記錄的項目，輸入詳細資訊後確認發布
        </p>
      </div>
    </div>
  );
};
