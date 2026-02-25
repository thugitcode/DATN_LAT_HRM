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
    icon: icons.time,
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
