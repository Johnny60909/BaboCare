import { BarChart3 } from 'lucide-react';

/// <summary>
/// 分析頁面 - 佔位符
/// </summary>
export const AnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-babo-bg pb-24 flex items-center justify-center">
      <div className="text-center">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-babo-text mb-2">數據分析</h1>
        <p className="text-babo-text-light">功能開發中...</p>
      </div>
    </div>
  );
};
