import { useCallback, useMemo, useRef, useState } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';

import { PAGE_SIZE_OPTIONS } from '@/lib/utils';
import { useDepartmentOptions } from '@/hooks/options/use-department-options';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { ActionsPage } from '@/components/actions-page';
import { ColumnVisibilityPopover } from '@/components/column-visibility-popover';
import DataTable from '@/components/data-table/data-table';
import { PageContainer } from '@/components/page-container';
import { TitlePage } from '@/components/title-page';

import { LeaveRequestFitlers } from './components/leave-request-fitlers';
import { LeaveRequestPrint } from './components/leave-request-print';
import { exportLeaveRequestToExcel } from './components/leave-request.export';
import { SummaryBadges } from './components/summary-badges';
import { useColumns } from './hooks/use-columns';
import { useLeaveRequestManagementList } from './hooks/use-leave-request';
import type { LeaveRequestManagementFilters } from './type';

const TABLE_CLASS_NAMES = { wrapper: 'h-[calc(100vh-400px)]' } as const;

export const LeaveRequestManagement = () => {
  const { t } = useTranslation(NAMESPACES.LEAVE_MANAGEMENT);

  const { filters } = useQueryFilter<LeaveRequestManagementFilters>();
  const { departmentId, month, roomId, search, status, type, page, limit, departmentIds, roomIds } =
    filters;

  const { columns } = useColumns();
  const { startDate, endDate } = useMonthDateRange(month);

  const { options: departmentOptions } = useDepartmentOptions();
  const departmentName = useMemo(() => {
    if (!departmentIds) return '';
    return departmentOptions.find((d) => d.key === departmentIds)?.label ?? '';
  }, [departmentOptions, departmentIds]);

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

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const exportKeys = new Set([...visibleColumns].filter((k) => k !== 'actions'));
    exportLeaveRequestToExcel(data?.data ?? [], exportKeys, departmentName);
  }, [data?.data, visibleColumns, departmentName]);

  // ── Print ─────────────────────────────────────────────────────────────────
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

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
        <TitlePage title={t('leave_request.title')} />

        <div className="flex items-center gap-2">
          <ActionsPage onPrint={handlePrint} onExport={handleExport} hiddenLayoutSwitcher />
          <ColumnVisibilityPopover
            columns={columns}
            visibleColumns={visibleColumns}
            onApply={handleApplyColumns}
          />
        </div>
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

      {/* Hidden print area */}
      <div style={{ display: 'none' }}>
        <LeaveRequestPrint
          ref={printRef}
          data={data?.data ?? []}
          visibleColumns={visibleColumns}
          departmentName={departmentName}
        />
      </div>
    </PageContainer>
  );
};
