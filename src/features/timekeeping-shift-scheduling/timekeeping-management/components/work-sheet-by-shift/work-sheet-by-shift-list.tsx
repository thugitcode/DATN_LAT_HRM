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
}

export const WorkSheetByShiftList: FC<WorkSheetByShiftListProps> = ({
  data = [],
  total,
  page,
  pageSize,
  isLoading,
  totalPage,
}) => {
  const { columns } = useWorkSheetColumns();
  // const dataSource = useMemo(() => {
  //   const grouped = groupByStaff(data);

  //   console.log('grouped+____________', grouped);

  //   return Array.from(grouped.values()).map(mapToListRow);
  // }, [data]);

  const dataSource = useMemo(() => {
    return data.map(mapToListRow);
  }, [data]);

  return (
    <Table
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
