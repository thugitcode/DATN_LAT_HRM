import { memo, type FC } from 'react';
import { Link } from '@tanstack/react-router';

import type { MenuItem } from '@/types/global.type';

export const MainNavItem: FC<Readonly<MenuItem>> = memo(({ label, path }) => {
  return (
    <li>
      <Link
        to={path}
        className="px-4 py-2 text-medium font-medium text-[#A1A1AA] hover:text-white transition-all duration-200 rounded-xl whitespace-nowrap"
        activeProps={{
          className: 'text-white bg-[#006FEE] shadow-sm rounded-xl',
        }}
      >
        {label}
      </Link>
    </li>
  );
});

MainNavItem.displayName = 'MainNavItem';
