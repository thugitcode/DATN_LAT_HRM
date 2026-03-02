import type { AttendanceExplanationType } from '@/types/attendance-explanation.type';
import { cn } from '@/lib/utils';
import { attendanceExplanationUI } from '@/features/timekeeping-shift-scheduling/explanation-management/constants/data';

interface Props {
  type: AttendanceExplanationType;
}
export function AttendanceBadge({ type }: Props) {
  const config = attendanceExplanationUI[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        config.className,
        'text-[11px] font-semibold px-2 py-1 flex items-center gap-1 rounded-full w-fit',
      )}
    >
      <Icon size={14} />
      {config.label}
    </div>
  );
}
