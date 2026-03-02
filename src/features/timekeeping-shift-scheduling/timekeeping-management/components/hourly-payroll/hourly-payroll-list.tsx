import type { FC } from 'react';

import { PAGE_SIZE_OPTIONS } from '@/lib/utils';
import { Table } from '@/components/table/table';

import { useColumnsHourlyPayroll } from '../../hooks/use-columns-hourly-payroll';
import type { AttendanceByHoursResponse } from '../../types/timekeeping-management.type';

interface HourlyPayrollListProps {
  data?: AttendanceByHoursResponse[];
  total?: number;
  page?: number;
  pageSize?: number;
  isLoading?: boolean;
  totalPage?: number;
}

export const HourlyPayrollList: FC<HourlyPayrollListProps> = ({
  data = [],
  isLoading,
  page,
  pageSize,
  total,
  totalPage,
}) => {
  const { columns } = useColumnsHourlyPayroll();

  return (
    <Table
      loading={isLoading}
      columns={columns}
      dataSource={data ?? []}
      rowKey="staffId"
      size="middle"
      className="h-[calc(100vh-440px)]"
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
