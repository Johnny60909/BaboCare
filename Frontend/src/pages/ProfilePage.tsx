import { useRef } from "react";
import { ProfileSettingsMenu } from "../components/ProfileSettingsMenu";

/// <summary>
/// 使用者個人資料頁面
/// </summary>
export const ProfilePage = () => {
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {/* 頁面頭部 - 只有設定圖標 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="w-6" />
        <h1 className="text-lg font-semibold">個人中心</h1>
        <div className="relative" ref={settingsMenuRef}>
          <ProfileSettingsMenu settingsMenuRef={settingsMenuRef} />
        </div>
      </div>

      {/* 內容區域 - 為未來擴展而保留 */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center text-babo-text-light">
          {/* 佔位符 - 未來會新增功能 */}
        </div>
      </div>
    </div>
  );
};
