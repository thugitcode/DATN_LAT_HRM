import { useCallback, useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import type { Staff } from '@/types/shift-management.type';
import { cn } from '@/lib/utils';
import { getStaffPosition } from '@/features/timekeeping-shift-scheduling/shift-management/constants/data';

import { StaffItem } from './staff-item';
import { StaffListSkeleton } from './staff-list-skeleton';

type StaffListProps = {
  activeStaffId: string | number | null;
  onSelect: (id: string) => void;
  staffList?: Staff[];
  isLoading?: boolean;
};

const SCROLLBAR_CLASSES = [
  '[&::-webkit-scrollbar]:w-1',
  '[&::-webkit-scrollbar-thumb]:rounded-full',
  '[&::-webkit-scrollbar-thumb]:bg-transparent',
  '[&::-webkit-scrollbar-track]:bg-transparent',
  'hover:[&::-webkit-scrollbar-thumb]:bg-gray-300',
].join(' ');

export const StaffList = ({
  activeStaffId,
  onSelect,
  staffList = [],
  isLoading,
}: StaffListProps) => {
  const { t } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);

  const staffPosition = useMemo(() => getStaffPosition(t), [t]);

  const handleSelect = useCallback(
    (s: Staff) => {
      onSelect(s.id);
    },
    [onSelect],
  );

  if (isLoading) {
    return <StaffListSkeleton />;
  }

  return (
    <div className={cn('w-58 h-[90%] overflow-y-auto space-y-1', SCROLLBAR_CLASSES)}>
      {staffList.map((s, i) => (
        <StaffItem
          key={s.id}
          staff={s}
          index={i}
          isActive={activeStaffId === s.id}
          position={staffPosition?.[s.position]}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
};
