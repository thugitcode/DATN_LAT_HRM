import { type FC } from 'react';

import { StaffAvatar } from '@/features/timekeeping-shift-scheduling/components/staff-avatar';
import { STAFF_POSITION } from '../../constants/data';
import type { StaffRow } from '../../types/type';

export const StaffInfo: FC<{ staff: StaffRow }> = ({ staff }) => (
  <div
    className="flex flex-1 items-center gap-2 min-w-0 py-0.5 w-full overflow-hidden"
    title={staff.name}
  >
    <StaffAvatar avatarUrl={staff?.avatar} name={staff?.name} />

    <div className="flex-1 text-left">
      <p className="text-sm font-semibold text-[#18181B] leading-tight truncate ">{staff.name}</p>
      <p className="text-[11px] text-[#71717A] ">
        {staff?.role && STAFF_POSITION?.[staff.role]} - {staff?.code}
      </p>
      <p className="text-[11px] text-[#A1A1AA] truncate">{staff.department}</p>
    </div>
  </div>
);
