import { useCallback, useMemo } from 'react';

import { LayoutSwitcherEnum } from '@/types/global.type';
import { useDepartmentOptions } from '@/hooks/options/use-department-options';
import { useQueryFilter } from '@/hooks/useQueryFilter';
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

type ExportHandler = (
  data: unknown[],
  year: number,
  month: number,
  departmentName?: string,
) => void;

interface TabExportConfig {
  listExport: ExportHandler;
  gridExport?: ExportHandler;
}

const TAB_EXPORT_CONFIG: Record<TAB_KEYS, TabExportConfig> = {
  [TAB_KEYS.WORKSHEET_BY_SHIFT]: {
    listExport: exportWorkSheetByShiftTable as ExportHandler,
    gridExport: exportWorkSheetByShiftGrid as ExportHandler,
  },
  [TAB_KEYS.HOURLY_PAYROLL]: {
    listExport: exportHourlyPayrollTable as ExportHandler,
    gridExport: exportHourlyPayrollGrid as ExportHandler,
  },
  [TAB_KEYS.DETAILED_TIME_SHEET]: {
    listExport: exportDetailedTimeSheet as ExportHandler,
  },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTimekeepingExport(activeKey: TAB_KEYS, data: unknown[] = []) {
  const { month, year } = useYearMonth();
  const currentLayout = useCurrentLayout();
  const isGrid = currentLayout === LayoutSwitcherEnum.GRID;

  const { filters } = useQueryFilter();
  const { options: departmentOptions } = useDepartmentOptions();

  const departmentName = useMemo(() => {
    if (!filters?.departmentId) return '';
    return departmentOptions.find((d) => d.key === filters.departmentId)?.label ?? '';
  }, [departmentOptions, filters.departmentId]);

  const onExport = useCallback(() => {
    const tabConfig = TAB_EXPORT_CONFIG[activeKey];
    if (!tabConfig) return;

    const exportFn = isGrid && tabConfig.gridExport ? tabConfig.gridExport : tabConfig.listExport;
    exportFn(data, year, month, departmentName);
  }, [activeKey, isGrid, data, year, month, departmentName]);

  return { onExport };
}
