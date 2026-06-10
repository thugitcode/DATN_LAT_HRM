import DataTable, { type ColumnDef } from '@/components/data-table/data-table';
import type { PaginationConfig } from '@/components/table/types';

const TABLE_CLASS_NAMES = { wrapper: 'h-[calc(100vh-280px)]' } as const;

export interface StaffManagementGridProps<TData extends object> {
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading: boolean;
  pagination: PaginationConfig;
}

export const StaffManagementGrid = <TData extends object>({
  columns,
  data,
  isLoading,
  pagination,
}: StaffManagementGridProps<TData>) => {
  return <div>Grid</div>;
};
