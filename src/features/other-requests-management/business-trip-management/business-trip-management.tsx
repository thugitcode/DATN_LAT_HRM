import { useMemo, useRef } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';

import { PAGE_SIZE_OPTIONS } from '@/lib/utils';
import { useColumnVisibility } from '@/hooks/use-column-visibility';
import { useDepartmentName } from '@/hooks/use-department-name';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { ActionsPage } from '@/components/actions-page';
import { ColumnVisibilityPopover } from '@/components/column-visibility-popover';
import DataTable from '@/components/data-table/data-table';
import { PageContainer } from '@/components/page-container';
import { TitlePage } from '@/components/title-page';

import { OtherRequestManagementFilters } from '../components/other-request-management-filter';
import { useBusinessTripColumns } from '../hooks/use-business-trip-columns';
import { useBusinessTripExport } from '../hooks/use-business-trip-export';
import { useBusinessTripManagement } from '../hooks/use-business-trip-management';
import type { OtherRequestsManagementParams } from '../types/type';

const TABLE_CLASS_NAMES = { wrapper: 'h-[calc(100vh-300px)]' } as const;

export const BusinessTripManagement = () => {
  const { t } = useTranslation(NAMESPACES.OTHER_REQUESTS_MANGAGEMENT);
  const { columns } = useBusinessTripColumns();
  const printRef = useRef<HTMLDivElement>(null);

  const { filters } = useQueryFilter<OtherRequestsManagementParams>();

  const { departmentId, month, roomId, search, status, type, page, limit } = filters;
  const { startDate, endDate } = useMonthDateRange(month);

  const { departmentName } = useDepartmentName({ departmentId: departmentId as string });

  const { visibleColumns, handleApplyColumns } = useColumnVisibility({
    columns,
  });

  const { data, isLoading } = useBusinessTripManagement({
    fromDate: startDate,
    toDate: endDate,
    departmentId,
    roomId,
    search,
    status,
    type,
    page,
    limit,
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

  const { handleExport } = useBusinessTripExport({
    data: data?.data ?? [],
    companyName: 'Công ty.....',
    unitName: 'Unit Name',
    departmentName,
  });

  const handlePrint = useReactToPrint({ contentRef: printRef });

  return (
    <PageContainer className="space-y-3.75">
      <div className="flex items-center justify-between">
        <TitlePage title={t('businessTripManagement.title')} />

        <div className="flex items-center gap-2">
          <ActionsPage onPrint={handlePrint} onExport={handleExport} hiddenLayoutSwitcher />
          <ColumnVisibilityPopover
            columns={columns}
            visibleColumns={visibleColumns}
            onApply={handleApplyColumns}
          />
        </div>
      </div>

      <OtherRequestManagementFilters />

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
