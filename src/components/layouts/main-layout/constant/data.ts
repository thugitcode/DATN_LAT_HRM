import type { MenuItem } from '@/types/global.type';
import { icons } from '@/lib/icons';

export const menuSidebar: MenuItem[] = [
  // {
  //   id: '1',
  //   path: '/admin/dashboard',
  //   label: 'Tổng quan',
  //   icon: icons.home,
  // },
  {
    id: '2',
    path: '/admin/timekeeping-shift-scheduling',
    label: 'Chấm công và phân ca',
    icon: icons.calendar,
    children: [
      {
        id: '1',
        label: 'Quản lý chấm công',
        path: '/admin/timekeeping-shift-scheduling/timekeeping-management',
      },
      {
        id: '2',
        label: 'Quản lý giải trình',
        path: '/admin/timekeeping-shift-scheduling/explanation-management',
      },
      {
        id: '3',
        label: 'Quản lý phân ca',
        path: '/admin/timekeeping-shift-scheduling/shift-management',
      },
    ],
  },
  {
    id: '3',
    path: '/admin/leave-management',
    label: 'Quản lý nghỉ',
    icon: icons.clockX,
    children: [
      {
        id: '1',
        label: 'Quản lý đăng ký nghỉ',
        path: '/admin/leave-management/leave-request-management',
      },
    ],
  },
  {
    id: '4',
    path: '/admin/staff-management',
    label: 'Quản lý nhân sự',
    icon: icons.userInfor,
    children: [
      {
        id: '1',
        label: 'Nhân viên chính thức',
        path: '/admin/staff-management/official-staff',
      },
      {
        id: '2',
        label: 'Nhân viên thử việc',
        path: '/admin/staff-management/probationary-staff',
      },
      {
        id: '3',
        label: 'Nhân viên học việc',
        path: '/admin/staff-management/apprentice-staff',
      },
      {
        id: '4',
        label: 'Nhân sự hợp tác',
        path: '/admin/staff-management/partner-staff',
      },
    ],
  },
  // {
  //   id: '5',
  //   path: '/admin/contract-management',
  //   label: 'Quản lý hợp đồng',
  //   icon: icons.notePen,
  // },
  // {
  //   id: '6',
  //   path: '/admin/payroll-management',
  //   label: 'Quản lý lương',
  //   icon: icons.payroll,
  // },
  // {
  //   id: '7',
  //   path: '/admin/recruitment-management',
  //   label: 'Quản lý tuyển dụng',
  //   icon: icons.plusUser,
  // },
  // {
  //   id: '8',
  //   path: '/admin/management-report',
  //   label: 'Báo cáo quản trị',
  //   icon: icons.note,
  // },
];
