import React from 'react';

import { DataTable, type ColumnDef } from '@/components/data-table/data-table';
import { PageContainer } from '@/components/page-container';
import type { PaginationConfig } from '@/components/table/types';
import { TitlePage } from '@/components/title-page';
import { OtherRequestManagementFilters } from '@/features/other-requests-management/components/other-request-management-filter';

export interface StaffManagementPageProps<TData extends object> {
  title: string;
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading: boolean;
  pagination: PaginationConfig;
  onExport: () => void;
  onPrint: () => void;
  visibleColumns: Set<string>;
  onApplyColumns: (visibleKeys: Set<string>, saveAsDefault: boolean) => void;
  printContent: React.ReactNode;
}

const TABLE_CLASS_NAMES = { wrapper: 'h-[calc(100vh-300px)]' } as const;

export const StaffManagementPage = <TData extends object>({
  columns,
  data,
  isLoading,
  onApplyColumns,
  onExport,
  onPrint,
  pagination,
  printContent,
  title,
  visibleColumns,
}: StaffManagementPageProps<TData>) => {
  return (
    <PageContainer className="space-y-3.75">
      <div className="flex items-center justify-between">
        <TitlePage title={title} />
        <div className="flex items-center gap-2">
          {/* <ActionsPage onPrint={onPrint} onExport={onExport} hiddenLayoutSwitcher /> */}

          <div>Action page</div>
        </div>
      </div>

      <div>Staff</div>

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
