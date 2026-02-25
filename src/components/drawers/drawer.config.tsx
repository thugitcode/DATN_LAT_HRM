import { DrawerType } from '@/store/useDrawer';
import type { DrawerProps } from '@heroui/react';

import { ChangeShiftDivision } from '@/features/timekeeping-shift-scheduling/shift-management/components/change-shift-division';
import { WorkShiftsForm } from '@/features/timekeeping-shift-scheduling/shift-management/components/work-shifts-form';
import { ExplanationDetailDrawer } from '@/features/timekeeping-shift-scheduling/explanation-management/components/explanation-detail-drawer';

type DrawerConfig = {
  title: string;
  component: React.ReactNode;
  drawerProps?: Partial<DrawerProps>;
  classNames?: {
    base?: string;
    wrapper?: string;
    content?: string;
  };
};

export const DRAWER_CONFIG: Record<DrawerType, DrawerConfig> = {
  [DrawerType.WORK_SHIFTS]: {
    title: 'Phân ca làm việc',
    component: <WorkShiftsForm />,
    drawerProps: {
      placement: 'right',
      size: '2xl',
    },
  },
  [DrawerType.CHANGE_SHIFT_DIVISION]: {
    title: 'Thay đổi phân ca',
    component: <ChangeShiftDivision />,
    drawerProps: {
      placement: 'right',
      size: '2xl',
    },
  },
  [DrawerType.EXPLANATION_DETAIL]: {
    title: 'Giải trình ca',
    component: <ExplanationDetailDrawer />,
    drawerProps: {
      placement: 'right',
      size: '2xl',
      classNames: {
        body: 'p-0 bg-[#F4F4F5]',
      }
    },
  },
};
