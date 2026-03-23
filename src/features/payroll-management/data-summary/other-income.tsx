import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import type { RequestsParams } from '@/types/global.type';
import { icons } from '@/lib/icons';
import { usePaginationConfig } from '@/hooks/use-pagination-config';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { ActionButton } from '@/components/action-button';
import DataTable from '@/components/data-table/data-table';
import { TitlePage } from '@/components/title-page';

import { useOtherIncomeColumns } from '../colums/use-other-income-columns';
import { BtnCreateOtherIncome } from '../components/btn-create-other-income';
import { PayrollManagementFilters } from '../components/payroll-management-filters';
import { statusKpiOptions } from '../constants/constants';
import { useOtherIncomeList } from '../hooks/use-payroll-management';

const TABLE_CLASS_NAMES = { wrapper: 'h-[calc(100vh-340px)]' } as const;

export const OtherIncome = () => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);
  const { filters, clearFilters } = useQueryFilter<RequestsParams>();
  const { departmentId, month, roomId, search, status, page, limit } = filters;

  const { columns } = useOtherIncomeColumns();

  const { data, isLoading } = useOtherIncomeList({
    page: page ?? 1,
    limit: limit ?? 10,
    month,
    search: search,
    departmentId: departmentId,
    roomId: roomId,
    status,
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
        <TitlePage title={t('otherIncome.title')} />

        <div className="flex items-center gap-3">
          <ActionButton
            tooltip={tc('actions.reload')}
            ariaLabel={tc('actions.reload')}
            onPress={clearFilters}
          >
            {icons.reload}
          </ActionButton>

          <BtnCreateOtherIncome />
        </div>
      </div>

      <PayrollManagementFilters />

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
