import { type FC } from 'react';

import type { StaffSchedule } from '@/types';
import { PAGE_SIZE_OPTIONS } from '@/lib/utils';
import { Table } from '@/components/table/table';

import { useColumns } from '../hooks/use-columns';

interface ShiftManagementListviewProps {
  data?: StaffSchedule[];
  total?: number;
  page?: number;
  pageSize?: number;
  isLoading?: boolean;
}

export const ShiftManagementListview: FC<Readonly<ShiftManagementListviewProps>> = ({
  data,
  total,
  page,
  pageSize,
  isLoading,
}) => {
  const { columns } = useColumns();

  return (
    <Table
      loading={isLoading}
      columns={columns}
      dataSource={data ?? []}
      size="middle"
      className="h-[calc(100vh-384px)]"
      pagination={{
        current: page,
        pageSize,
        total: total || 0,
        showSizeChanger: true,
        pageSizeOptions: PAGE_SIZE_OPTIONS,
      }}
    />
  );
};
