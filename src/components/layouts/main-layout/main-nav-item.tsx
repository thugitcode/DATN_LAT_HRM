import { memo, type FC } from 'react';
import { Link } from '@tanstack/react-router';

import type { MenuItem } from '@/types/global.type';

export const MainNavItem: FC<Readonly<MenuItem>> = memo(({ label, path }) => {
  return (
    <li>
      <Link
        to={path}
        className="px-4 py-2 text-medium font-semibold text-[#2C3782] hover:text-primary-500 uppercase transition-all duration-200 whitespace-nowrap"
        activeProps={{
          className: 'text-primary border-b-2 border-primary',
        }}
      >
        {label}
      </Link>
    </li>
  );
});

MainNavItem.displayName = 'MainNavItem';
