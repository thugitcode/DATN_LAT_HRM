import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { shiftDetailsQueryOptions } from '@/services/query-options/shift-details';
import { timekeepingManagementQueryOptions } from '@/services/query-options/timekeeping-management.query';
import { useReactToPrint } from 'react-to-print';

import type { DetailsTimeSheetRecord } from '@/types/shift-details.type';
import { useYearMonth } from '@/features/timekeeping-shift-scheduling/hooks/use-year-month';

import { TAB_KEYS } from '../types/index.type';
import type {
  AttendanceByHoursResponse,
  WorkSheetByShiftType,
} from '../types/timekeeping-management.type';

const TAB_QUERY_CONFIG: Record<TAB_KEYS, (params: { getAll: boolean }) => unknown> = {
  [TAB_KEYS.WORKSHEET_BY_SHIFT]: timekeepingManagementQueryOptions.attendanceTable,
  [TAB_KEYS.HOURLY_PAYROLL]: timekeepingManagementQueryOptions.attendanceByHours,
  [TAB_KEYS.DETAILED_TIME_SHEET]: shiftDetailsQueryOptions.list,
};

export type TimekeepingPrintState =
  | { tab: TAB_KEYS.WORKSHEET_BY_SHIFT; data: WorkSheetByShiftType[] }
  | { tab: TAB_KEYS.HOURLY_PAYROLL; data: AttendanceByHoursResponse[] }
  | { tab: TAB_KEYS.DETAILED_TIME_SHEET; data: DetailsTimeSheetRecord[] }
  | null;

export function useTimekeepingPrint(activeKey: TAB_KEYS) {
  const { month, year } = useYearMonth();
  const queryClient = useQueryClient();
  const [printState, setPrintState] = useState<TimekeepingPrintState>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const triggerPrint = useReactToPrint({ contentRef: printRef });

  const onPrint = useCallback(async () => {
    const queryOption = TAB_QUERY_CONFIG[activeKey];
    if (!queryOption) return;

    const result = await queryClient.fetchQuery(
      queryOption({ getAll: true }) as Parameters<typeof queryClient.fetchQuery>[0],
    );

    const data = (result as { data?: unknown[] })?.data ?? [];

    setPrintState({ tab: activeKey, data } as TimekeepingPrintState);

    // requestAnimationFrame ensures React has committed the new state to DOM
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        triggerPrint();
      });
    });
  }, [activeKey, queryClient, triggerPrint]);

  return { onPrint, printState, printRef, year, month };
}
