import { useMemo, type FC } from 'react';

import { PAGE_SIZE_OPTIONS } from '@/lib/utils';
import { Table } from '@/components/table/table';

import { useWorkSheetColumns } from '../../hooks/use-work-sheet-columns';
import type { WorkSheetByShiftType } from '../../types/timekeeping-management.type';

interface WorkSheetByShiftListProps {
  data?: WorkSheetByShiftType[];
  total?: number;
  page?: number;
  pageSize?: number;
  isLoading?: boolean;
  totalPage?: number;
  search?: string;
  month?: string;
}

export const WorkSheetByShiftList: FC<WorkSheetByShiftListProps> = ({
  data = [],
  total,
  page,
  pageSize,
  isLoading,
  totalPage,
  search,
  month,
}) => {
  const { columns } = useWorkSheetColumns();

  const dataSource = useMemo(() => {
    if (isLoading) return [];
    return data;
  }, [data, isLoading]);

  // Tính total từ data nếu API không trả về
  const resolvedTotal = total ?? data?.length ?? 0;

  return (
    <Table
      key={`page-${page}-${pageSize}-${search}-${month}`}
      columns={columns as any}
      dataSource={dataSource as any ?? []}
      size="middle"
      loading={isLoading}
      className="h-[calc(100vh-390px)]"
      pagination={{
        current: page ?? 1,
        pageSize: pageSize ?? 10,
        total: resolvedTotal,
        showSizeChanger: true,
        pageSizeOptions: PAGE_SIZE_OPTIONS,
        totalPage,
      }}
    />
  );
};