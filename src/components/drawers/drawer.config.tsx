import { NAMESPACES } from '@/i18n/constants';
import { DrawerType } from '@/store/useDrawer';
import type { DrawerProps } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { DetailPayslipFeedback } from '@/features/payroll-management/components/detail-payslip-feedback';
import { FormKpiMutate } from '@/features/payroll-management/components/form-kpi-mutate';
import { FormOtherIncomeMutate } from '@/features/payroll-management/components/form-other-income-mutate';
import { EnterRevenueDrawer } from '@/features/payroll-management/components/revenue/enter-revenue-drawer';
import { TimekeepingDetails } from '@/features/payroll-management/components/timekeeping-details';
import { FormAddNewPayPeriodsMutate } from '@/features/payroll-management/manage-pay-periods/components/form-add-new-pay-periods-mutate';
import { FormStaffMutate } from '@/features/staff-management/core/components/form-staff-mutate';
import { ProfileDetailsDrawer } from '@/features/staff-management/profile-staff/components/profile-details-drawer';
import { ExplanationDetailDrawer } from '@/features/timekeeping-shift-scheduling/explanation-management/components/explanation-detail-drawer';
import { ChangeShiftDivision } from '@/features/timekeeping-shift-scheduling/shift-management/components/change-shift-division';
import { WorkShiftsForm } from '@/features/timekeeping-shift-scheduling/shift-management/components/work-shifts-form';
import { ShiftDetailsDrawer } from '@/features/timekeeping-shift-scheduling/timekeeping-management/components/detailed-time-sheet/shift-details-drawer';

type DrawerConfig = {
  title: string;
  component: React.ReactNode;
  drawerProps?: Partial<DrawerProps>;
  classNames?: {
    base?: string;
    wrapper?: string;
    content?: string;
    header?: string;
  };
};

export const useDrawerConfig = (): Record<DrawerType, DrawerConfig> => {
  const { t } = useTranslation(NAMESPACES.COMMON);

  return {
    [DrawerType.WORK_SHIFTS]: {
      title: t('drawer.work_shifts'),
      component: <WorkShiftsForm />,
      drawerProps: { placement: 'right', size: '2xl' },
      classNames: { header: 'text-[30px] px-6 pt-6 pb-3' },
    },
    [DrawerType.CHANGE_SHIFT_DIVISION]: {
      title: t('drawer.change_shift_division'),
      component: <ChangeShiftDivision />,
      drawerProps: { placement: 'right', size: '2xl' },
      classNames: { header: 'text-[30px] px-6 pt-6 pb-3' },
    },
    [DrawerType.EXPLANATION_DETAIL]: {
      title: t('drawer.explanation_detail'),
      component: <ExplanationDetailDrawer />,
      drawerProps: {
        placement: 'right',
        size: '2xl',
        classNames: { body: 'p-0 bg-[#F4F4F5]' },
      },
    },
    [DrawerType.TIME_SHEET_DETAIL]: {
      title: t('drawer.time_sheet_detail'),
      component: <ShiftDetailsDrawer />,
      drawerProps: {
        placement: 'right',
        size: '2xl',
        classNames: { body: 'p-0 bg-[#F4F4F5]' },
      },
    },
    [DrawerType.PROFILE_STAFF_DETAIL]: {
      title: t('drawer.profile_staff_detail'),
      component: <ProfileDetailsDrawer />,
      drawerProps: {
        placement: 'right',
        size: '2xl',
        classNames: { body: 'p-0 bg-[#F4F4F5]' },
      },
    },
    [DrawerType.TIMEKEEPING_DETAILS]: {
      title: t('drawer.timekeepingDetails'),
      component: <TimekeepingDetails />,
      drawerProps: {
        placement: 'right',
        size: '5xl',
        style: { width: '97vw', maxWidth: '97vw' },
        classNames: { body: 'p-0 bg-[#F4F4F5]' },
      },
    },
    [DrawerType.CREATE_KPI]: {
      title: t('drawer.enter_kpi'),
      component: <FormKpiMutate />,
      drawerProps: {
        placement: 'right',
        size: '2xl',
        classNames: { body: 'p-0 bg-[#F4F4F5]' },
      },
    },
    [DrawerType.REVENUE_DETAILS]: {
      title: t('drawer.revenueDetails'),
      component: <EnterRevenueDrawer />,
      drawerProps: {
        placement: 'right',
        size: '2xl',
        classNames: { body: 'p-0 bg-[#F4F4F5]' },
      },
    },
    [DrawerType.CREATE_OTHER_INCOME]: {
      title: t('drawer.additionalArisingAmounts'),
      component: <FormOtherIncomeMutate />,
      drawerProps: {
        placement: 'right',
        size: '2xl',
        classNames: { body: 'p-0 bg-[#F4F4F5]' },
      },
    },
    [DrawerType.STAFF_MUTATE]: {
      title: t('drawer.additionalArisingAmounts'),
      component: <FormStaffMutate />,
      drawerProps: {
        placement: 'right',
        size: '2xl',
        style: { width: '97vw', maxWidth: '97vw' },
        classNames: { body: 'p-0 bg-[#F4F4F5]' },
      },
    },

    [DrawerType.ADD_NEW_PAYROLL_PERIOD]: {
      title: 'Thêm mới kỳ lương',
      component: <FormAddNewPayPeriodsMutate />,
      drawerProps: {
        placement: 'right',
        size: '2xl',
        classNames: { body: 'p-0 bg-[#F4F4F5]' },
      },
    },
    [DrawerType.DETAIL_PAYSLIP_FEEDBACK]: {
      title: '',
      component: <DetailPayslipFeedback />,
      drawerProps: {
        placement: 'right',
        size: '2xl',
        classNames: { body: 'p-0 bg-[#F4F4F5]', header: 'p-0!' },
      },
    },
  };
};
