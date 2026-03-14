import type { FC } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { Button, Switch } from '@heroui/react';
import { IconPencil } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import type { Staff } from '@/types/staff.type';
import { DataTable, type ColumnDef } from '@/components/data-table/data-table';

import { useStaffColumns } from '../hooks/use-staff-columns';

interface StaffTableProps {
  data: Staff[];
  loading?: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onViewDetail?: (id: string) => void;
  onEdit?: (staff: Staff) => void;
}

export const StaffTable: FC<StaffTableProps> = ({
  data,
  loading,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onViewDetail,
  onEdit,
}) => {
  const totalPages = Math.ceil((total || 1) / limit);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);
  const { columns } = useStaffColumns();
  // Update the actions column to include the edit handler
  const columnsWithHandlers: ColumnDef<Staff>[] = columns.map((col) => {
    if (col.key === 'actions') {
      return {
        ...col,
        render: (_: unknown, record: Staff) => (
          <div className="flex items-center gap-3">
            <Switch size="sm" isSelected={record.activeStatus === 'ACTIVE'} />
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-[#71717A]"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(record);
              }}
            >
              <IconPencil size={18} stroke={1.5} />
            </Button>
          </div>
        ),
      };
    }
    return col;
  });

  if (loading) {
    return (
      <div className="flex-1 h-[calc(100vh-315px)] flex flex-col min-h-0 bg-white shadow-sm border border-[#E4E4E7] rounded-xl overflow-hidden mt-4 items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#006FEE] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    // <div className="p-4 bg-white flex-1 overflow-auto">
    <DataTable
      selectionMode="single"
      columns={columnsWithHandlers}
      dataSource={data}
      loading={loading}
      emptyContent={tc('table.empty')}
      pagination={{
        current: page,
        pageSize: limit,
        total: total,
        totalPage: totalPages,
        showSizeChanger: true,
        pageSizeOptions: [10, 25, 50, 100],
        onChange: (page, pageSize) => {
          onPageChange(page);
          onLimitChange(pageSize);
        },
      }}
      classNames={{ wrapper: 'h-[calc(100vh-315px)]' }}
      onRowClick={(record) => onViewDetail?.(record.id)}
    />
    // </div>
  );
};
