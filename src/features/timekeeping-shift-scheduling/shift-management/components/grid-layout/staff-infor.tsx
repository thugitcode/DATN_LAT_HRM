import { type FC } from 'react';

import { STAFF_POSITION } from '../../constants/data';
import type { StaffRow } from '../../types/type';
import { ShiftAvatar } from '../shift-avatar';

export const StaffInfo: FC<{ staff: StaffRow }> = ({ staff }) => (
  <div className="flex items-center gap-2 min-w-0 py-0.5 w-full overflow-hidden" title={staff.name}>
    <ShiftAvatar avatarUrl={staff?.avatar} name={staff?.name} />

    <div className="min-w-0 flex-1 text-left">
      <p className="text-sm font-semibold text-[#18181B] leading-tight truncate ">{staff.name}</p>
      <p className="text-[11px] text-[#71717A] text-nowrap">
        {staff?.role && STAFF_POSITION?.[staff.role]} - {staff?.code}
      </p>
      <p className="text-[11px] text-[#A1A1AA] truncate">{staff.department}</p>
    </div>
  </div>
);
