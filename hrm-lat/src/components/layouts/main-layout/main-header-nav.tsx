import { useLocation } from '@tanstack/react-router';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import { getMenuSidebar } from './constant/data';
import { MainNavItem } from './main-nav-item';

export const MainHeaderNav = () => {
  const { t } = useTranslation(NAMESPACES.COMMON);
  const location = useLocation();
  const pathname = location.pathname || '/';

  const menuSidebar = getMenuSidebar(t);

  const activeMenuItem = menuSidebar.find((item) => {
    if (!item.children || item.children.length === 0 || !item.path) return false;
    return pathname.startsWith(item.path) && item.path !== '/';
  });

  const navItems = activeMenuItem?.children || [];

  if (navItems.length === 0) return null;

  return (
    <ul className="flex items-center justify-center gap-1 flex-nowrap">
      {navItems.map((item) => (
        <MainNavItem key={item.id} {...item} />
      ))}
    </ul>
  );
};
