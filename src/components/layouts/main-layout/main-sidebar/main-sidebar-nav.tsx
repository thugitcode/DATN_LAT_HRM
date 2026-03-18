import type { FC } from 'react';
import { Link } from '@tanstack/react-router';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

import { getMenuSidebar } from '../constant/data';

interface MainSidebarNavProps {
  isCollapsed: boolean;
}

export const MainSidebarNav: FC<MainSidebarNavProps> = ({ isCollapsed }) => {
  const { t } = useTranslation(NAMESPACES.COMMON);
  const menuSidebar = getMenuSidebar(t);

  return (
    <ul className="flex flex-col gap-1 w-full">
      {menuSidebar?.map((menu) => (
        <li key={menu.id}>
          <Link
            to={menu.path}
            className={cn(
              'group flex items-center w-full rounded-[14px] overflow-hidden h-12 gap-2 py-3 text-[16px] leading-6 tracking-normal text-nowrap transition-colors',
              isCollapsed ? 'justify-center' : 'px-6',
            )}
            activeProps={{
              className: 'text-white bg-[#006FEE]',
            }}
          >
            <span className="shrink-0 group-[.active]:text-white">{menu.icon}</span>
            {!isCollapsed && <span>{menu.label}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
};
