import { memo, type FC } from 'react';

import type { Staff } from '@/types/shift-management.type';
import { cn } from '@/lib/utils';
import { StaffAvatar } from '@/features/timekeeping-shift-scheduling/components/staff-avatar';

interface StaffItemProps {
  staff: Staff;
  index: number;
  isActive: boolean;
  position: string | undefined;
  onSelect: (staff: Staff) => void;
}

export const StaffItem: FC<StaffItemProps> = memo(
  ({ staff, index, isActive, position, onSelect }) => (
    <div
      role="button"
      tabIndex={0}
      aria-selected={isActive}
      onClick={() => onSelect(staff)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(staff)}
      className={cn(
        'rounded-[14px] flex items-center gap-2 px-2.5 py-3 cursor-pointer',
        'transition-all duration-150 select-none',
        isActive
          ? 'bg-blue-500 shadow-sm'
          : [
              index % 2 === 0 ? 'bg-white' : 'bg-transparent',
              'hover:bg-blue-50 active:scale-[0.98]',
            ],
      )}
    >
      <StaffAvatar avatarUrl={staff.avatar} name={staff.name} />
      <div className="flex flex-col flex-1 min-w-0">
        <span
          className={cn(
            'text-sm font-medium truncate transition-colors duration-150',
            isActive ? 'text-white' : 'text-[#11181C]',
          )}
        >
          {staff.name}
        </span>
        <span
          className={cn(
            'text-xs truncate transition-colors duration-150',
            isActive ? 'text-blue-100' : 'text-[#A1A1AA]',
          )}
        >
          {position} - {staff.code}
        </span>
      </div>
    </div>
  ),
);

StaffItem.displayName = 'StaffItem';
