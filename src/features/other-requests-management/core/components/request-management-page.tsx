import { ActionsPage } from '@/components/actions-page';
import { ColumnVisibilityPopover } from '@/components/column-visibility-popover';
import DataTable from '@/components/data-table/data-table';
import { PageContainer } from '@/components/page-container';
import { TitlePage } from '@/components/title-page';

import { OtherRequestManagementFilters } from '../../components/other-request-management-filter';
import type { RequestManagementPageProps } from '../types/request-management.types';

const TABLE_CLASS_NAMES = { wrapper: 'h-[calc(100vh-300px)]' } as const;

export const RequestManagementPage = <TData extends object>({
  title,
  columns,
  data,
  isLoading,
  pagination,
  onExport,
  onPrint,
  visibleColumns,
  onApplyColumns,
  printContent,
}: RequestManagementPageProps<TData>) => {
  return (
    <PageContainer className="space-y-3.75">
      <div className="flex items-center justify-between">
        <TitlePage title={title} />
        <div className="flex items-center gap-2">
          <ActionsPage onPrint={onPrint} onExport={onExport} hiddenLayoutSwitcher />
          <ColumnVisibilityPopover
            columns={columns}
            visibleColumns={visibleColumns}
            onApply={onApplyColumns}
          />
        </div>
      </div>

      <OtherRequestManagementFilters />

      <DataTable
        dataSource={data}
        columns={columns}
        selectionMode="single"
        loading={isLoading}
        classNames={TABLE_CLASS_NAMES}
        visibleColumns={visibleColumns}
        pagination={pagination}
      />

      <div className="hidden">{printContent}</div>
    </PageContainer>
  );
};
