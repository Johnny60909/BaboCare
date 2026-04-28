import { useState, useEffect, type RefObject } from "react";
import { LogOut, MoreVertical, Settings, Lock } from "lucide-react";
import { useLogout } from "../hooks/queries/useLogout";
import { useNavigate } from "react-router";
import { useUserRoles } from "../hooks/useUserRoles";

interface ProfileSettingsMenuProps {
  settingsMenuRef: RefObject<HTMLDivElement | null>;
  onAccountSettingsClick?: () => void;
}

/// <summary>
/// 個人資料設定選單
/// </summary>
export const ProfileSettingsMenu = ({
  settingsMenuRef,
  onAccountSettingsClick,
}: ProfileSettingsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const roles = useUserRoles();
  const isAdmin = roles.some((r) => r === "SystemAdmin" || r === "Nanny");

  // 點擊外部時關閉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, settingsMenuRef]);

  const handleAccountSettings = () => {
    setIsOpen(false);
    onAccountSettingsClick?.();
  };

  const handleAdminAccess = () => {
    setIsOpen(false);
    navigate("/admin");
  };

  return (
    <div className="relative">
      {/* 設定圖標按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="設定"
      >
        <MoreVertical size={20} className="text-babo-text" />
      </button>

      {/* 下拉選單 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-[20px] shadow-lg shadow-black/10 border border-gray-200 z-50 overflow-hidden animate-in fade-in duration-200">
          <div className="py-2">
            {/* 帳戶設定 */}
            <button
              onClick={handleAccountSettings}
              className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <Settings size={16} className="text-babo-primary" />
              帳戶設定
            </button>

            {/* 後台管理（僅 admin） */}
            {isAdmin && (
              <button
                onClick={handleAdminAccess}
                className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <Lock size={16} className="text-amber-600" />
                進入後台管理
              </button>
            )}

            {/* 分隔線 */}
            <div className="border-t border-gray-200 my-2" />

            {/* 登出按鈕 */}
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-red-50 transition-colors text-red-600 font-medium"
            >
              <LogOut size={16} />
              登出
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
