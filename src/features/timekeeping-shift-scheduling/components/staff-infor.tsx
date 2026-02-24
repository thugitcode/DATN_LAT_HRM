import { memo, type FC } from 'react';

import type { StaffPosition } from '@/types/global.type';

import { STAFF_POSITION } from '../shift-management/constants/data';
import { StaffAvatar } from './staff-avatar';

interface StaffInfoProps {
  avatarUrl?: string;
  name?: string;
  role?: StaffPosition;
  code?: string;
  departmentName?: string;
}

export const StaffInfo: FC<Readonly<StaffInfoProps>> = memo(
  ({ avatarUrl, code, departmentName, name, role }) => (
    <div className="flex items-center gap-2 min-w-0 py-0.5 w-full overflow-hidden" title={name}>
      <StaffAvatar avatarUrl={avatarUrl} name={name} />

      <div className="min-w-0 flex-1 text-left">
        <p className="text-sm font-semibold text-[#18181B] leading-tight truncate ">{name}</p>
        <p className="text-[11px] text-[#71717A] text-nowrap">
          {role && STAFF_POSITION?.[role]} - {code}
        </p>
        <p className="text-[11px] text-[#A1A1AA] truncate">{departmentName}</p>
      </div>
    </div>
  ),
);

StaffInfo.displayName = 'StaffInfo';
