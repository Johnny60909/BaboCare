import { Outlet } from 'react-router';
import { BottomNavigation } from './BottomNavigation';

export const UserLayout = () => (
  <div className="pb-16">
    <Outlet />
    <BottomNavigation />
  </div>
);
