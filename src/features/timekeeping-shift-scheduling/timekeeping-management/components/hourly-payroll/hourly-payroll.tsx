import { LayoutSwitcherEnum } from '@/types/global.type';
import { LayoutRenderer } from '@/features/timekeeping-shift-scheduling/components/layout-renderer';

import { HourlyPayrollGrid } from './hourly-payroll-grid';
import { HourlyPayrollList } from './hourly-payroll-list';

export const HourlyPayroll = () => {
  return (
    <LayoutRenderer
      layouts={{
        [LayoutSwitcherEnum.LIST]: HourlyPayrollList,
        [LayoutSwitcherEnum.GRID]: HourlyPayrollGrid,
      }}
    />
  );
};
