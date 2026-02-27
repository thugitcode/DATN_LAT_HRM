import { Table } from '@/components/table/table';

import type { ApiResponse } from '@/types';
import { useColumnsHourlyPayroll } from '../../hooks/use-columns-hourly-payroll';
import type { AttendanceByHoursResponse } from '../../types/timekeeping-management.type';

export const HourlyPayrollList = (data: ApiResponse<AttendanceByHoursResponse[]>) => {
  const { columns } = useColumnsHourlyPayroll();

  return (
    <Table
      columns={columns}
      dataSource={data?.data ?? []}
      rowKey="staffId"
      size="middle"
      className="h-[calc(100vh-440px)]"
      pagination={{
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        pageSizeOptions: [5, 10, 20, 50],
        onChange: (page, pageSize) => {
          console.log('Page changed:', page, pageSize);
        },
      }}
    />
  );
};
