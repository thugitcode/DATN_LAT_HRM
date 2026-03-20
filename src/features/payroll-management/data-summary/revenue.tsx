import { NAMESPACES } from '@/i18n/constants';
import { DrawerType } from '@/store/useDrawer';
import { useTranslation } from 'react-i18next';

import type { RequestsParams } from '@/types/global.type';
import { icons } from '@/lib/icons';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { usePaginationConfig } from '@/hooks/use-pagination-config';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { ActionButton } from '@/components/action-button';
import DataTable from '@/components/data-table/data-table';
import { PageContainer } from '@/components/page-container';
import { PageFilter } from '@/components/page-filter';
import { TitlePage } from '@/components/title-page';

import { useRevenueDataColumns } from '../colums/use-revenue-columns';
import { BtnCreateKpi } from '../components/btn-create-kpi';
import { PayrollManagementFilters } from '../components/payroll-management-filters';
import { statusRevenueOptions } from '../constants/constants';
import { useRevenueList } from '../hooks/use-revenue-management';

const TABLE_CLASS_NAMES = { wrapper: 'h-[calc(100vh-380px)]' } as const;

export const RevenueData = () => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);
  const { columns } = useRevenueDataColumns();

  const { filters, clearFilters } = useQueryFilter<RequestsParams>();
  const { departmentId, month, roomId, search, status, page, limit } = filters;
  const { startDate, endDate } = useMonthDateRange(month);

  const { data, isLoading } = useRevenueList({
    page: page ?? 1,
    limit: limit ?? 10,
    startDate,
    endDate,
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
        <TitlePage title={t('data_summary.tabs.revenue')} />

        <div className="flex items-center gap-3">
          <ActionButton
            tooltip={tc('actions.reload')}
            ariaLabel={tc('actions.reload')}
            onPress={clearFilters}
          >
            {icons.reload}
          </ActionButton>

          <BtnCreateKpi drawerType={DrawerType.REVENUE_DETAILS} />
        </div>
      </div>

      <PayrollManagementFilters statusOptions={statusRevenueOptions} />

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
