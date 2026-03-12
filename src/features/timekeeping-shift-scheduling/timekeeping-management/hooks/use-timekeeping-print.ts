import { useCallback, useMemo, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

import type { DetailsTimeSheetRecord } from '@/types/shift-details.type';
import { useDepartmentOptions } from '@/hooks/options/use-department-options';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { useYearMonth } from '@/features/timekeeping-shift-scheduling/hooks/use-year-month';

import { TAB_KEYS } from '../types/index.type';
import type {
  AttendanceByHoursResponse,
  WorkSheetByShiftType,
} from '../types/timekeeping-management.type';

export type TimekeepingPrintState =
  | { tab: TAB_KEYS.WORKSHEET_BY_SHIFT; data: WorkSheetByShiftType[] }
  | { tab: TAB_KEYS.HOURLY_PAYROLL; data: AttendanceByHoursResponse[] }
  | { tab: TAB_KEYS.DETAILED_TIME_SHEET; data: DetailsTimeSheetRecord[] };

export function useTimekeepingPrint(activeKey: TAB_KEYS, data: unknown[] = []) {
  const { month, year } = useYearMonth();
  const printRef = useRef<HTMLDivElement>(null);

  const { filters } = useQueryFilter();
  const { options: departmentOptions } = useDepartmentOptions();

  const departmentName = useMemo(() => {
    if (!filters?.departmentId) return '';
    return departmentOptions.find((d) => d.key === filters.departmentId)?.label ?? '';
  }, [departmentOptions, filters.departmentId]);

  const triggerPrint = useReactToPrint({ contentRef: printRef });

  const onPrint = useCallback(() => {
    triggerPrint();
  }, [triggerPrint]);

  const printState: TimekeepingPrintState = {
    tab: activeKey,
    data,
  } as TimekeepingPrintState;

  return { onPrint, printState, printRef, year, month, departmentName };
}
