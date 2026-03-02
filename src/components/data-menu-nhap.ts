import type { MenuItem } from '@/types/global.type';
import { icons } from '@/lib/icons';

export const menuSidebar: MenuItem[] = [
  {
    id: '1',
    path: '/',
    label: 'Tổng quan',
    icon: icons.home,
  },
  {
    id: '2',
    path: '/timekeeping-shift-scheduling',
    label: 'Chấm công và phân ca',
    icon: icons.calendar,
    children: [
      {
        id: '1',
        label: 'Quản lý chấm công',
        path: '/timekeeping-shift-scheduling/timekeeping-management',
      },
      {
        id: '2',
        label: 'Quản lý giải trình',
        path: '/timekeeping-shift-scheduling/explanation-management',
      },
      {
        id: '3',
        label: 'Quản lý phân ca',
        path: '/timekeeping-shift-scheduling/shift-management',
      },
    ],
  },
  // {
  //   id: '3',
  //   path: '/admin/dashboard',
  //   label: 'Quản lý nghỉ',
  //   icon: icons.job,
  // },
  // {
  //   id: '4',
  //   path: '/admin/dashboard',
  //   label: 'Quản lý nhân sự',
  //   icon: icons.plusUser,
  // },
  // {
  //   id: '5',
  //   path: '/admin/dashboard',
  //   label: 'Quản lý hợp đồng',
  //   icon: icons.note,
  // },
  // {
  //   id: '6',
  //   path: '/admin/dashboard',
  //   label: 'Quản lý lương',
  //   icon: icons.note,
  // },
  // {
  //   id: '7',
  //   path: '/admin/dashboard',
  //   label: 'Quản lý tuyển dụng',
  //   icon: icons.note,
  // },
  // {
  //   id: '8',
  //   path: '/admin/dashboard',
  //   label: 'Báo cáo quản trị',
  //   icon: icons.note,
  // },
];

// import { memo, type FC } from 'react';
// import { Link } from '@tanstack/react-router';

// import type { MenuItem } from '@/types/global.type';

// export const MainNavItem: FC<Readonly<MenuItem>> = memo(({ label, path }) => {
//   return (
//     <li>
//       <Link
//         to={path}
//         className="px-3 py-1  text-medium font-normal text-[#71717A] hover:text-white duration-75 ease-in-out "
//         activeProps={{
//           className: 'text-white bg-[#006FEE] rounded-lg',
//         }}
//       >
//         {label}
//       </Link>
//     </li>
//   );
// });

// MainNavItem.displayName = 'MainNavItem';
