import type { FC } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { Button, Switch } from '@heroui/react';
import { IconEye, IconPencil } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { ActiveStatusEnum, type Staff } from '@/types/staff.type';
import { DataTable, type ColumnDef } from '@/components/data-table/data-table';
import { useUpdateStaff } from '@/query-options/staff';
import { useConfirmStore } from '@/store/useConfirmStore';

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
  // onEdit?: (staff: Staff) => void;
  onEdit?: (id: string) => void;
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
  const { t: ts } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
  const { columns } = useStaffColumns();
  const { mutate: updateStaff, isPending: isUpdatingStatus } = useUpdateStaff();
  const openConfirm = useConfirmStore((state) => state.open);

  const handleToggleStatus = (record: Staff, checked: boolean) => {
    const nextStatus = checked ? ActiveStatusEnum.ACTIVE : ActiveStatusEnum.INACTIVE;
    openConfirm(
      {
        title: checked ? ts('staff_table.activate_title') : ts('staff_table.deactivate_title'),
        description: checked
          ? ts('staff_table.activate_confirm', { name: record.name })
          : ts('staff_table.deactivate_confirm', { name: record.name }),
        confirmLabel: tc('button.confirm'),
        confirmColor: 'primary',
      },
      async () => {
        updateStaff({ id: record.id, data: { activeStatus: nextStatus } });
      },
    );
  };

  // Update the actions column to include the edit handler
  const columnsWithHandlers: ColumnDef<Staff>[] = columns.map((col) => {
    if (col.key === 'actions') {
      return {
        ...col,
        sticky: 'right',
        render: (_: unknown, record: Staff) => (
          <div className="flex items-center gap-3">
            <Switch
              size="sm"
              isSelected={record.activeStatus === ActiveStatusEnum.ACTIVE}
              isDisabled={isUpdatingStatus}
              onValueChange={(checked) => handleToggleStatus(record, checked)}
            />
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-[#71717A]"
              onPress={(e) => {
                // e.stopPropagation();
                if (!record.id) return;
                onEdit?.(record.id);
              }}
            >
              {record?.activeStatus === ActiveStatusEnum.ACTIVE ? <IconPencil size={18} stroke={1.5} /> : <IconEye size={18} stroke={1.5} />}
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
        <div className="w-8 h-8 border-2 border-[#6576FF] border-t-transparent rounded-full animate-spin" />
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
