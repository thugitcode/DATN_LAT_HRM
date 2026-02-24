import { LayoutSwitcherEnum } from '@/types/global.type';
import { LayoutRenderer } from '@/features/timekeeping-shift-scheduling/components/layout-renderer';

import { WorkSheetByShiftGrid } from './work-sheet-by-shift-grid';
import { WorkSheetByShiftList } from './work-sheet-by-shift-list';

export const WorkSheetByShift = () => {
  return (
    <LayoutRenderer
      layouts={{
        [LayoutSwitcherEnum.LIST]: WorkSheetByShiftList,
        [LayoutSwitcherEnum.GRID]: WorkSheetByShiftGrid,
      }}
    />
  );
};
