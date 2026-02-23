import { memo, type FC } from 'react';

import type { Staff } from '@/types/shift-management.type';

import { STAFF_POSITION } from '../constants/data';
import { ShiftAvatar } from './shift-avatar';

interface ShiftDepartmentProps {
  staff?: Staff;
}

export const ShiftDepartment: FC<Readonly<ShiftDepartmentProps>> = memo(({ staff }) => {
  return (
    <div className="flex items-center gap-2" title={staff?.name}>
      <ShiftAvatar avatarUrl={staff?.avatar} name={staff?.name} />

      <div className="text-[#A1A1AA] text-xs leading-4 font-normal flex-1">
        <span className="text-[#11181C] text-sm">{staff?.name}</span> <br />
        <span className="text-nowrap">
          {staff?.position && STAFF_POSITION?.[staff.position]} - {staff?.code}
        </span>
        <br />
        <span>{staff?.departmentName}</span>
      </div>
    </div>
  );
});

ShiftDepartment.displayName = 'ShiftDepartment';
