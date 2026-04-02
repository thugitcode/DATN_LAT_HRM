import type { NAMESPACES } from '@/i18n/constants';
import type { TFunction } from 'i18next';

import type { MenuItem } from '@/types/global.type';
import { icons } from '@/lib/icons';

export const getMenuSidebar = (t: TFunction<typeof NAMESPACES.COMMON>): MenuItem[] => [
  {
    id: '2',
    path: '/admin/timekeeping-shift-scheduling',
    label: t('sidebar.timekeeping_shift_scheduling'),
    icon: icons.calendar,
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
        path: '/admin/staff-management/official-staff',
      },
      {
        id: '2',
        label: t('sidebar.probationary_staff'),
        path: '/admin/staff-management/probationary-staff',
      },
      {
        id: '3',
        label: t('sidebar.apprentice_staff'),
        path: '/admin/staff-management/apprentice-staff',
      },
      {
        id: '4',
        label: t('sidebar.partner_staff'),
        path: '/admin/staff-management/partner-staff',
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

  {
    id: '8',
    path: '/admin/other-requests-management',
    label: t('sidebar.other_requests_management'),
    icon: icons.listMenu,
    children: [
      {
        id: '1',
        label: t('sidebar.business_trip_management'),
        path: '/admin/other-requests-management/business-trip-management',
      },
      {
        id: '2',
        label: t('sidebar.overtime_management'),
        path: '/admin/other-requests-management/overtime-management',
      },
      {
        id: '3',
        label: t('sidebar.remote_work_management'),
        path: '/admin/other-requests-management/remote-work-management',
      },
      {
        id: '4',
        label: t('sidebar.training_registration_management'),
        path: '/admin/other-requests-management/training-registration-ranagement',
      },
    ],
  },
  {
    id: '9',
    path: '/admin/recruitment-management',
    label: t('sidebar.recruitment_management'),
    icon: icons.recruitment,
    children: [
      {
        id: '1',
        label: t('sidebar.recruitment_request'),
        path: '/admin/recruitment-management/recruitment-request',
      },
      {
        id: '2',
        label: t('sidebar.candidate'),
        path: '/admin/recruitment-management/candidate',
      },
      {
        id: '3',
        label: t('sidebar.interview_schedule'),
        path: '/admin/recruitment-management/interview-schedule',
      },
      {
        id: '4',
        label: t('sidebar.probation_management'),
        path: '/admin/recruitment-management/probation-management',
      },
      {
        id: '5',
        label: t('sidebar.recruitment_report'),
        path: '/admin/recruitment-management/report',
      },
    ],
  },
];

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
  //   id: '9',
  //   path: '/admin/management-report',
  //   label: 'Báo cáo quản trị',
  //   icon: icons.note,
  // },
];
