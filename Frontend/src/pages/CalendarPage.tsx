import { Calendar } from 'lucide-react';

/// <summary>
/// 行事曆頁面 - 佔位符
/// </summary>
export const CalendarPage = () => {
  return (
    <div className="min-h-screen bg-babo-bg pb-24 flex items-center justify-center">
      <div className="text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-babo-text mb-2">行事曆</h1>
        <p className="text-babo-text-light">功能開發中...</p>
      </div>
    </div>
  );
};
