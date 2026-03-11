import { useCallback, useMemo, useState } from 'react';

import { PAGE_SIZE_OPTIONS } from '@/lib/utils';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { ColumnVisibilityPopover } from '@/components/column-visibility-popover';
import DataTable from '@/components/data-table/data-table';
import { PageContainer } from '@/components/page-container';
import { PageFilter } from '@/components/page-filter';
import { TitlePage } from '@/components/title-page';

import { LeaveRequestFitlers } from './components/leave-request-fitlers';
import { SummaryBadges } from './components/summary-badges';
import { useColumns } from './hooks/use-columns';
import { useLeaveRequestManagementList } from './hooks/use-leave-request';
import type { LeaveRequestManagementFilters } from './type';

const TABLE_CLASS_NAMES = { wrapper: 'h-[calc(100vh-400px)]' } as const;

export const LeaveRequestManagement = () => {
  const { filters } = useQueryFilter<LeaveRequestManagementFilters>();
  const { departmentId, month, roomId, search, status, type, page, limit, departmentIds, roomIds } =
    filters;

  const { columns } = useColumns();
  const { startDate, endDate } = useMonthDateRange(month);

  const defaultVisibleColumns = useMemo(
    () => new Set(columns.map((col) => col.key)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(defaultVisibleColumns);

  const { data, isLoading } = useLeaveRequestManagementList({
    fromDate: startDate,
    toDate: endDate,
    departmentId,
    roomId,
    search,
    status,
    type,
    page,
    limit,
    departmentIds,
    roomIds,
  });

  const handleApplyColumns = useCallback((visibleKeys: Set<string>, _saveAsDefault: boolean) => {
    setVisibleColumns(visibleKeys);
  }, []);

  const paginationConfig = useMemo(
    () => ({
      current: Number(page),
      showSizeChanger: true,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      total: data?.pagination?.total,
      pageSize: Number(limit),
      totalPage: data?.pagination?.totalPage,
    }),
    [page, limit, data?.pagination],
  );

  return (
    <PageContainer className="space-y-3.75">
      <div className="flex items-center justify-between">
        <TitlePage title="Quản lý đăng ký nghỉ" />

        <ColumnVisibilityPopover
          columns={columns}
          visibleColumns={visibleColumns}
          onApply={handleApplyColumns}
        />
      </div>

      <LeaveRequestFitlers />

      <SummaryBadges summary={data?.metadata} />

      <DataTable
        dataSource={data?.data ?? []}
        columns={columns}
        selectionMode="single"
        loading={isLoading}
        classNames={TABLE_CLASS_NAMES}
        visibleColumns={visibleColumns}
        pagination={paginationConfig}
      />
    </PageContainer>
  );
};
