import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import type { RequestsParams } from '@/types/global.type';
import { icons } from '@/lib/icons';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { usePaginationConfig } from '@/hooks/use-pagination-config';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { ActionButton } from '@/components/action-button';
import DataTable from '@/components/data-table/data-table';
import { PageFilter } from '@/components/page-filter';
import { TitlePage } from '@/components/title-page';
import { useAttendanceTable } from '@/features/timekeeping-shift-scheduling/timekeeping-management/hooks/use-timekeeping-management';

import { useAttendanceDataColumns } from '../colums/use-attendance-data-columns';

const TABLE_CLASS_NAMES = { wrapper: 'h-[calc(100vh-340px)] ' } as const;

export const AttendanceData = () => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);
  const { columns } = useAttendanceDataColumns();

  const { filters, clearFilters } = useQueryFilter<RequestsParams>();
  const { departmentId, month, roomId, search, status, page, limit } = filters;
  const { startDate, endDate } = useMonthDateRange(month);

  // const { visibleColumns, handleApplyColumns } = useColumnVisibility({
  //   columns,
  // });

  const { data, isLoading } = useAttendanceTable({
    page: page ?? 1,
    limit: limit ?? 10,
    fromDate: startDate,
    toDate: endDate,
    search: search,
    departmentId: departmentId,
    roomId: roomId,
  });

  const { paginationConfig } = usePaginationConfig({
    page,
    limit,
    total: data?.pagination?.total,
    totalPage: data?.pagination?.totalPage,
  });

  return (
    <div className="space-y-3 px-0">
      <div className="flex items-center justify-between">
        <TitlePage title={t('data_summary.tabs.attendance_data')} />

        <ul className="flex items-center gap-2">
          <li>
            <ActionButton
              tooltip={tc('actions.reload')}
              ariaLabel={tc('actions.reload')}
              onPress={clearFilters}
            >
              {icons.reload}
            </ActionButton>
          </li>
        </ul>
      </div>

      <PageFilter />

      <DataTable
        dataSource={data?.data ?? []}
        columns={columns}
        selectionMode="single"
        loading={isLoading}
        classNames={TABLE_CLASS_NAMES}
        pagination={paginationConfig}
      />
    </div>
  );
};
