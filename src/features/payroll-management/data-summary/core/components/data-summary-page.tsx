// components/payroll-data-page.tsx
import type { ReactNode } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import type { Options } from '@/types/global.type';
import { icons } from '@/lib/icons';
import { ActionButton } from '@/components/action-button';
import DataTable, { type ColumnDef } from '@/components/data-table/data-table';
import { TitlePage } from '@/components/title-page';
import { PayrollManagementFilters } from '@/features/payroll-management/components/payroll-management-filters';

import { useDataSummaryPage } from '../hooks/use-payroll-data-page';

const TABLE_CLASS_NAMES = { wrapper: 'h-[calc(100vh-380px)]' } as const;

interface PayrollDataPageProps<TData extends object> {
  title: string;
  columns: ColumnDef<TData>[];
  statusOptions: Options[];
  fetchFn: Parameters<typeof useDataSummaryPage<TData>>[0]['fetchFn'];
  createButton?: ReactNode;
}

export const DataSummaryPage = <TData extends object>({
  title,
  columns,
  statusOptions,
  fetchFn,
  createButton,
}: PayrollDataPageProps<TData>) => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);

  const { data, isLoading, paginationConfig, clearFilters } = useDataSummaryPage({ fetchFn });

  return (
    <div className="space-y-3 px-0">
      <div className="flex items-center justify-between">
        <TitlePage title={title} />

        <div className="flex items-center gap-3">
          <ActionButton
            tooltip={tc('actions.reload')}
            ariaLabel={tc('actions.reload')}
            onPress={clearFilters}
          >
            {icons.reload}
          </ActionButton>
          {createButton}
        </div>
      </div>

      <PayrollManagementFilters statusOptions={statusOptions} />

      <DataTable
        dataSource={data}
        columns={columns}
        selectionMode="single"
        loading={isLoading}
        classNames={TABLE_CLASS_NAMES}
        pagination={paginationConfig}
      />
    </div>
  );
};
