import { useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';
import { getMenuSidebar } from '../constant/data';

export const useMenuSidebar = () => {
  const { t } = useTranslation(NAMESPACES.COMMON);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const menus = getMenuSidebar(t);

  const activeMenu = menus.find((menu) => {
    if (menu.children?.length) {
      return menu.children.some((child) => pathname.startsWith(child.path as string));
    }
    return pathname.startsWith(menu.path as string);
  }) ?? null;

  const activeChild = activeMenu?.children?.find((child) =>
    pathname.startsWith(child.path as string),
  ) ?? null;

  return { menus, activeMenu, activeChild };
};
