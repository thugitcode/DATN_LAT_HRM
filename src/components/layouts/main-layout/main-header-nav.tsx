import { useLocation } from '@tanstack/react-router';

import { menuSidebar } from './constant/data';
import { MainNavItem } from './main-nav-item';

export const MainHeaderNav = () => {
  const location = useLocation();
  const pathname = location.pathname || '/';

  const activeMenuItem = menuSidebar.find((item) => {
    if (!item.children || item.children.length === 0 || !item.path) return false;

    return pathname.startsWith(item.path) && item.path !== '/';
  });

  const navItems = activeMenuItem?.children || [];

  if (navItems.length === 0) {
    return null;
  }

  return (
    <ul className="flex items-center justify-center gap-2">
      {navItems.map((item) => (
        <MainNavItem key={item.id} {...item} />
      ))}
    </ul>
  );
};
