import { useCallback, useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import { icons } from '@/lib/icons';
import { PAGE_SIZE_OPTIONS } from '@/lib/utils';
import { useColumnVisibility } from '@/hooks/use-column-visibility';
import { useDepartmentName } from '@/hooks/use-department-name';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { ActionButton } from '@/components/action-button';
import { ActionsPage } from '@/components/actions-page';
import { ColumnVisibilityPopover } from '@/components/column-visibility-popover';
import DataTable from '@/components/data-table/data-table';
import { PageContainer } from '@/components/page-container';
import { TitlePage } from '@/components/title-page';

import { OtherRequestManagementFilters } from '../components/other-request-management-filter';
import { useOtherRequestpManagement } from '../hooks/use-other-request-management';
import { useRemoteWorkColumns } from '../hooks/use-remote-work-columns';
import { CategoryGeneralRequest } from '../types/generate-request.type';
import type { OtherRequestsManagementParams } from '../types/type';

const TABLE_CLASS_NAMES = { wrapper: 'h-[calc(100vh-300px)]' } as const;

export const RemoteWorkManagement = () => {
  const { t } = useTranslation(NAMESPACES.OTHER_REQUESTS_MANGAGEMENT);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);

  const { columns } = useRemoteWorkColumns();

  const { filters, clearFilters } = useQueryFilter<OtherRequestsManagementParams>();

  const { departmentIds, month, roomIds, search, status, type, page, limit } = filters;
  const { startDate, endDate } = useMonthDateRange(month);

  const { departmentName } = useDepartmentName({ departmentId: departmentIds as string });

  const { visibleColumns, handleApplyColumns } = useColumnVisibility({
    columns,
  });

  const { data, isLoading } = useOtherRequestpManagement({
    fromDate: startDate,
    toDate: endDate,
    departmentIds,
    roomIds,
    search,
    status,
    type,
    page: page ?? 1,
    limit: limit ?? 10,
    category: CategoryGeneralRequest.REMOTE_WORK,
  });

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

  const handleExport = useCallback(() => {}, []);

  const handlePrint = () => {};

  return (
    <PageContainer className="space-y-3.75">
      <div className="flex items-center justify-between">
        <TitlePage title={t('remoteManagement.title')} />

        <div className="flex items-center gap-2">
          {/* <ActionsPage onPrint={handlePrint} onExport={handleExport} hiddenLayoutSwitcher /> */}
          <ActionButton
            tooltip={tc('actions.reload')}
            ariaLabel={tc('actions.reload')}
            onPress={clearFilters}
          >
            {icons.reload}
          </ActionButton>

          <ColumnVisibilityPopover
            columns={columns}
            visibleColumns={visibleColumns}
            onApply={handleApplyColumns}
          />
        </div>
      </div>

      <OtherRequestManagementFilters />

      <DataTable
        classNames={TABLE_CLASS_NAMES}
        dataSource={data?.data ?? []}
        columns={columns}
        selectionMode="single"
        loading={isLoading}
        visibleColumns={visibleColumns}
        pagination={paginationConfig}
      />
    </PageContainer>
  );
};
