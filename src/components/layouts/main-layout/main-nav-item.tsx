import { memo, type FC } from 'react';
import { Link } from '@tanstack/react-router';

import type { MenuItem } from '@/types/global.type';

export const MainNavItem: FC<Readonly<MenuItem>> = memo(({ label, path }) => {
  return (
    <li>
      <Link
        to={path}
        className="px-3 py-1  text-medium font-normal text-[#71717A] hover:text-white duration-75 ease-in-out "
        activeProps={{
          className: 'text-white bg-[#006FEE] rounded-lg',
        }}
      >
        {label}
      </Link>
    </li>
  );
});

MainNavItem.displayName = 'MainNavItem';
