import { Table } from '@/components/table/table';

import { useColumnsHourlyPayroll } from '../../hooks/use-columns-hourly-payroll';
import { hourlyPayrollMock } from './moc/hourly-payroll.mock';

export const HourlyPayrollList = () => {
  const { columns } = useColumnsHourlyPayroll();

  return (
    <Table
      columns={columns}
      dataSource={hourlyPayrollMock ?? []}
      rowKey="id"
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
