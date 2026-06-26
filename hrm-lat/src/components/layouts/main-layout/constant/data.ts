import type { NAMESPACES } from '@/i18n/constants';
import type { TFunction } from 'i18next';

import type { MenuItem } from '@/types/global.type';
import { icons } from '@/lib/icons';

export const getMenuSidebar = (t: TFunction<typeof NAMESPACES.COMMON>): MenuItem[] => [
  {
    id: '2',
    path: '/admin/timekeeping-shift-scheduling',
    label: t('sidebar.timekeeping_shift_scheduling'),
    icon: icons.calendarFill,
    children: [
      {
        id: '1',
        label: t('sidebar.timekeeping_management'),
        path: '/admin/timekeeping-shift-scheduling/timekeeping-management',
      },
      {
        id: '2',
        label: t('sidebar.explanation_management'),
        path: '/admin/timekeeping-shift-scheduling/explanation-management',
      },
      {
        id: '3',
        label: t('sidebar.shift_management'),
        path: '/admin/timekeeping-shift-scheduling/shift-management',
      },
    ],
  },
  {
    id: '3',
    path: '/admin/leave-management',
    label: t('sidebar.leave_management'),
    icon: icons.clockX,
    children: [
      {
        id: '1',
        label: t('sidebar.leave_request_management'),
        path: '/admin/leave-management/leave-request-management',
      },
    ],
  },
  {
    id: '4',
    path: '/admin/staff-management',
    label: t('sidebar.staff_management'),
    icon: icons.userInfor,
    children: [
      {
        id: '1',
        label: t('sidebar.official_staff'),
        path: '/admin/staff-management/official-employee',
      },
    ],
  },
  {
    id: '6',
    path: '/admin/payroll-management',
    label: t('sidebar.payroll_management'),
    icon: icons.payroll,
    children: [
      {
        id: '1',
        label: t('sidebar.payroll_data_summary'),
        path: '/admin/payroll-management/data-summary',
      },
      {
        id: '2',
        label: t('sidebar.payroll_calculation'),
        path: '/admin/payroll-management/payroll-calculation',
      },
      {
        id: '3',
        label: t('sidebar.payslip_feedback'),
        path: '/admin/payroll-management/payslip-feedback',
      },
      {
        id: '4',
        label: t('sidebar.employee_salary_history'),
        path: '/admin/payroll-management/salary-history',
      },
    ],
  },
  // Ẩn: Quản lý các yêu cầu khác và Tuyển dụng (ngoài scope đồ án)
];

export const menuSidebar: MenuItem[] = [
  {
    id: '2',
    path: '/admin/timekeeping-shift-scheduling',
    label: 'Chấm công và phân ca',
    icon: icons.calendarFill,
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
        path: '/admin/staff-management/official-employee',
      },
    ],
  },
];