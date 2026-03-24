import type { FC } from 'react';
import { Button, Switch } from '@heroui/react';
import { IconPencil } from '@tabler/icons-react';

import type { Staff } from '@/types/staff.type';

interface RowOfficialEmployeeActionsProps {
  dataRow?: Staff;
}

export const RowOfficialEmployeeActions: FC<RowOfficialEmployeeActionsProps> = ({ dataRow }) => {
  if (!dataRow) return null;

  return (
    <div className="flex items-center gap-3">
      <Switch size="sm" isSelected={dataRow.activeStatus === 'ACTIVE'} />
      <Button
        isIconOnly
        size="sm"
        variant="light"
        className="text-[#71717A]"
        onClick={(e) => {
          // e.stopPropagation();
          // onEdit?.(record);
        }}
      >
        <IconPencil size={18} stroke={1.5} />
      </Button>
    </div>
  );
};
