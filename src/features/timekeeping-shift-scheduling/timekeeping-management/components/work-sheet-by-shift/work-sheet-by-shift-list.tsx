import { Table } from '@/components/table/table';

import { useColumns } from '../../hooks/use-columns';

export const WorkSheetByShiftList = () => {
  const { columns } = useColumns();

  return (
    <Table
      columns={columns}
      dataSource={[]}
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
