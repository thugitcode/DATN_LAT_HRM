import { useMemo, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

import type { RequestsParams } from '@/types/global.type';
import { PAGE_SIZE_OPTIONS } from '@/lib/utils';
import { useDepartmentName } from '@/hooks/use-department-name';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { useQueryFilter } from '@/hooks/useQueryFilter';

// interface UseStaffManagementPagePageOptions<TData extends object> {
//   columns: ColumnDef<TData>[];
// }

export const useStaffManagementPage = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const { filters } = useQueryFilter<RequestsParams>();
  const {
    departmentIds,
    roomIds,
    month,
    search,
    status,
    type,
    page,
    limit,
    jobTitleId,
    positions,
    departmentId,
    roomId,
    contractType,
  } = filters;
  const { startDate, endDate } = useMonthDateRange(month);
  const { departmentName } = useDepartmentName({ departmentId });
  const handlePrint = useReactToPrint({ contentRef: printRef });

  const paginationConfig = useMemo(
    () => ({
      current: Number(page),
      showSizeChanger: true,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      total: undefined as number | undefined,
      pageSize: Number(limit),
      totalPage: undefined as number | undefined,
    }),
    [page, limit],
  );

  return {
    filters,
    startDate,
    endDate,
    departmentIds,
    roomIds,
    month,
    search,
    status,
    type,
    page,
    limit,
    printRef,
    departmentName,
    handlePrint,
    paginationConfig,
    jobTitleId,
    positions,
    departmentId,
    roomId,
    contractType,
  };
};
