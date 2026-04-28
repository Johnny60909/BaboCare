import { useRef, useState } from "react";
import { ProfileSettingsMenu } from "../components/ProfileSettingsMenu";
import { AccountSettingsForm } from "../components/AccountSettingsForm";

/// <summary>
/// 使用者個人資料頁面
/// </summary>
export const ProfilePage = () => {
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  const handleClose = () => {
    setIsEditingSettings(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* 頁面頭部 */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <div className="w-6" />
        <h1 className="text-lg font-bold text-babo-text">個人中心</h1>
        <div className="relative" ref={settingsMenuRef}>
          <ProfileSettingsMenu
            settingsMenuRef={settingsMenuRef}
            onAccountSettingsClick={() => setIsEditingSettings(true)}
          />
        </div>
      </div>

      {/* 頁面內容 */}
      <div className="pb-24 text-left">
        {isEditingSettings ? (
          <AccountSettingsForm onClose={handleClose} />
        ) : (
          <div className="flex-1 flex items-center justify-center px-6 pt-12">
            <div className="text-center text-babo-text-light">
              {/* 可以在這裡添加更多個人信息 */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
