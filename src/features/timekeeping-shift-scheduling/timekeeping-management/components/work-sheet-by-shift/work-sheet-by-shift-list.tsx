import { useMemo, type FC } from 'react';

import { PAGE_SIZE_OPTIONS } from '@/lib/utils';
import { Table } from '@/components/table/table';
import { groupByStaff, mapToListRow } from '@/features/timekeeping-shift-scheduling/helper';

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
    return data.map(mapToListRow);
  }, [data, isLoading]);

  return (
    <Table
      key={`page-${page}-${pageSize}-${search}-${month}`}
      columns={columns}
      dataSource={dataSource}
      size="middle"
      loading={isLoading}
      className="h-[calc(100vh-390px)]"
      pagination={{
        current: page,
        pageSize,
        total: total || 0,
        showSizeChanger: true,
        pageSizeOptions: PAGE_SIZE_OPTIONS,
        totalPage,
      }}
    />
  );
};
