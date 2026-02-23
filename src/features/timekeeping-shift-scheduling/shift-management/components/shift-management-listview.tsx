import { type FC } from 'react';

import type { StaffSchedule } from '@/types';
import { Table } from '@/components/table/table';

import { useColumns } from '../hooks/use-columns';

interface ShiftManagementListviewProps {
  data?: StaffSchedule[];
  total?: number;
}

export const ShiftManagementListview: FC<Readonly<ShiftManagementListviewProps>> = ({
  data,
  total,
}) => {
  const { columns } = useColumns();

  return (
    <div className="flex flex-col justify-between gap-7.5 h-full">
      <div className="flex-1 bg-white rounded-[14px] p-4">
        <Table
          columns={columns}
          dataSource={data ?? []}
          rowKey="id"
          size="middle"
          className="h-[calc(100vh-410px)]"
          pagination={{
            current: 1,
            pageSize: 10,
            total: total || 0,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50],
            onChange: (page, pageSize) => {
              console.log('Page changed:', page, pageSize);
            },
          }}
        />
      </div>
    </div>
  );
};
