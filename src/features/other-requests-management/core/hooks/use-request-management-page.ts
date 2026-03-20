import { useMemo, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

import { PAGE_SIZE_OPTIONS } from '@/lib/utils';
import { useColumnVisibility } from '@/hooks/use-column-visibility';
import { useDepartmentName } from '@/hooks/use-department-name';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import type { ColumnDef } from '@/components/data-table/data-table';

import type { OtherRequestsManagementParams } from '../../types/type';

interface UseRequestManagementPageOptions<TData extends object> {
  columns: ColumnDef<TData>[];
}

export const useRequestManagementPage = <TData extends object>({
  columns,
}: UseRequestManagementPageOptions<TData>) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { filters } = useQueryFilter<OtherRequestsManagementParams>();
  const { departmentIds, roomIds, month, search, status, type, page, limit } = filters;
  const { startDate, endDate } = useMonthDateRange(month);
  const { departmentName } = useDepartmentName({ departmentId: departmentIds as string });
  const { visibleColumns, handleApplyColumns } = useColumnVisibility({ columns });
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
    visibleColumns,
    handleApplyColumns,
    handlePrint,
    paginationConfig,
  };
};
