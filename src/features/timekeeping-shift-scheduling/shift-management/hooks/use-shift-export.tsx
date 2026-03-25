import { useCallback } from 'react';
import i18n from '@/i18n';
import { useStaffList } from '@/query-options/staff';
import { exportGridToExcel } from '@/templates/excels/shift-management/export-shift-grid';
import { exportTableToExcel } from '@/templates/excels/shift-management/export-shift-table';
import { exportTemplateToExcel } from '@/templates/excels/shift-management/export-shift-template';

import type { StaffSchedule } from '@/types';
import { LayoutSwitcherEnum } from '@/types/global.type';

import { useCurrentLayout } from '../../hooks/use-current-layout';
import { useYearMonth } from '../../hooks/use-year-month';

export const useShiftExport = (data: StaffSchedule[] = [], departmentName?: string) => {
  const { month, year } = useYearMonth();
  const currentLayout = useCurrentLayout();
  const isGrid = currentLayout === LayoutSwitcherEnum.GRID;
  const { data: staffList } = useStaffList({ page: 1, limit: 100 });

  const onExport = useCallback(async () => {
    await i18n.loadNamespaces('timekeeping-shift-scheduling');
    if (isGrid) exportGridToExcel(data, year, month, departmentName);
    else exportTableToExcel(data, year, month, departmentName);
  }, [isGrid, data, year, month, departmentName]);

  const onExportTemplate = useCallback(async () => {
    await i18n.loadNamespaces('timekeeping-shift-scheduling');
    exportTemplateToExcel(staffList?.data ?? [], year, month);
  }, [staffList?.data, year, month]);

  return { onExport, onExportTemplate };
};
