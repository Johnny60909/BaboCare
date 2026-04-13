import { Outlet } from 'react-router';
import { BottomNavigation } from './BottomNavigation';

/// <summary>
/// 用戶布局 - 包含底部導覽欄
/// </summary>
export const UserLayout = () => (
  <div className="pb-24">
    <Outlet />
    <BottomNavigation />
  </div>
);
