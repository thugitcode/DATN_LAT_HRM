import DataTable, { type ColumnDef } from '@/components/data-table/data-table';
import type { PaginationConfig } from '@/components/table/types';

const TABLE_CLASS_NAMES = { wrapper: 'h-[calc(100vh-280px)]' } as const;

export interface StaffManagementListProps<TData extends object> {
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading: boolean;
  pagination: PaginationConfig;
}

export const StaffManagementList = <TData extends object>({
  columns,
  data,
  isLoading,
  pagination,
}: StaffManagementListProps<TData>) => {
  return (
    <DataTable
      dataSource={data}
      columns={columns}
      selectionMode="single"
      loading={isLoading}
      classNames={TABLE_CLASS_NAMES}
      pagination={pagination}
    />
  );
};
