import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { shiftDetailsQueryOptions } from '@/services/query-options/shift-details';
import { timekeepingManagementQueryOptions } from '@/services/query-options/timekeeping-management.query';

import { LayoutSwitcherEnum } from '@/types/global.type';
import { useCurrentLayout } from '@/features/timekeeping-shift-scheduling/hooks/use-current-layout';
import { useYearMonth } from '@/features/timekeeping-shift-scheduling/hooks/use-year-month';

import { exportDetailedTimeSheet } from '../export-engine/detailed-timesheet.export';
import {
  exportHourlyPayrollGrid,
  exportHourlyPayrollTable,
} from '../export-engine/hourly-payroll.export';
import {
  exportWorkSheetByShiftGrid,
  exportWorkSheetByShiftTable,
} from '../export-engine/work-sheet-by-shift.export';
import { TAB_KEYS } from '../types/index.type';

// ─── Per-tab export config ────────────────────────────────────────────────────
// Adding a new tab = add one entry here. No changes elsewhere needed.

type ExportHandler = (data: unknown[], year: number, month: number) => void;

interface TabExportConfig {
  queryOption: (params: { getAll: boolean }) => unknown;
  listExport: ExportHandler;
  gridExport?: ExportHandler; // undefined = no grid variant (uses list)
}

const TAB_EXPORT_CONFIG: Record<TAB_KEYS, TabExportConfig> = {
  [TAB_KEYS.WORKSHEET_BY_SHIFT]: {
    queryOption: timekeepingManagementQueryOptions.attendanceTable,
    listExport: exportWorkSheetByShiftTable as ExportHandler,
    gridExport: exportWorkSheetByShiftGrid as ExportHandler,
  },
  [TAB_KEYS.HOURLY_PAYROLL]: {
    queryOption: timekeepingManagementQueryOptions.attendanceByHours,
    listExport: exportHourlyPayrollTable as ExportHandler,
    gridExport: exportHourlyPayrollGrid as ExportHandler,
  },
  [TAB_KEYS.DETAILED_TIME_SHEET]: {
    queryOption: shiftDetailsQueryOptions.list,
    listExport: exportDetailedTimeSheet as ExportHandler,
    // no grid variant for detailed sheet
  },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTimekeepingExport(activeKey: TAB_KEYS, data: unknown[] = []) {
  const { month, year } = useYearMonth();
  const currentLayout = useCurrentLayout();
  const isGrid = currentLayout === LayoutSwitcherEnum.GRID;

  const onExport = useCallback(() => {
    const tabConfig = TAB_EXPORT_CONFIG[activeKey];
    if (!tabConfig) return;
    
    const exportFn = isGrid && tabConfig.gridExport ? tabConfig.gridExport : tabConfig.listExport;
    exportFn(data, year, month);
  }, [activeKey, isGrid, data, year, month]);

  return { onExport };
}
