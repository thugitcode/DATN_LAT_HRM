import { memo, type FC } from 'react';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import { IconShield } from '@tabler/icons-react';
import { AttendanceStatus, type ShiftCode } from '../../types/index.type';

const BASE = 'size-9 rounded-full select-none cursor-pointer transition-all duration-150 hover:scale-110 hover:shadow-md flex items-center justify-center text-xs font-bold relative';

interface CellConfig { bg: string; text: string; label: string; icon?: boolean; }

function getCellConfig(shift: string): CellConfig {
  switch (shift) {
    // PRESENT — xanh lá
    case 'P': case 'Đ': case AttendanceStatus.OnTime:
      return { bg: 'bg-green-100', text: 'text-green-700', label: '✓' };
    // LATE / EARLY_LEAVE — cam
    case 'L': case 'M': case AttendanceStatus.Late:
    case 'EL': case 'S': case AttendanceStatus.EarlyLeave:
    case 'M/S': case AttendanceStatus.LateAndEarly:
      return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'M' };
    // ABSENT — đỏ
    case 'AB': case 'VM': case AttendanceStatus.Absent:
      return { bg: 'bg-red-100', text: 'text-red-700', label: 'V' };
    // APPROVED giải trình — xanh dương
    case 'GT':
      return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'GT', icon: true };
    // LEAVE_PAID — tím
    case 'LV': case AttendanceStatus.PaidLeave:
      return { bg: 'bg-purple-100', text: 'text-purple-700', label: 'P' };
    // NGÀY NGHỈ — xám
    case 'N': case 'SC': case AttendanceStatus.DayOff:
      return { bg: 'bg-gray-100', text: 'text-gray-400', label: 'N' };
    // HOLIDAY
    case 'H':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Lễ' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-400', label: shift ?? 'N' };
  }
}

interface NonPillBadgeProps {
  shift: ShiftCode | string;
  workScheduleDetailId?: string[] | string;
  shiftCode?: string;
  lateMinutes?: number;
}

export const NonPillBadge: FC<Readonly<NonPillBadgeProps>> = memo(
  ({ shift, workScheduleDetailId, shiftCode, lateMinutes }) => {
    const open = useDrawer((state) => state.onOpen);

    const onClick = () => {
      const id = Array.isArray(workScheduleDetailId) ? workScheduleDetailId[0] : workScheduleDetailId;
      if (id) open(DrawerType.TIME_SHEET_DETAIL, id);
    };

    const s = shift as string;

    // Ngày nghỉ: hatch pattern
    if (s === 'N' || s === 'SC' || (s as string) === AttendanceStatus.DayOff) {
      return (
        <div className={`${BASE} bg-gray-100 overflow-hidden`} onClick={onClick} title="Ngày nghỉ">
          <svg className="absolute inset-0 size-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="#d1d5db" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hatch)" />
          </svg>
          <span className="absolute inset-0 z-10 flex items-center justify-center text-xs font-semibold text-gray-400">N</span>
        </div>
      );
    }

    const config = getCellConfig(s);

    // Label động: muộn hiện M:Xm, present hiện mã ca
    let label = config.label;
    const isLate = ['L','M','EL','S','M/S',AttendanceStatus.Late,AttendanceStatus.EarlyLeave,AttendanceStatus.LateAndEarly].includes(s);
    const isPresent = ['P','Đ',AttendanceStatus.OnTime].includes(s);

    if (isLate && lateMinutes && lateMinutes > 0) {
      label = `M:${lateMinutes}m`;
    } else if (isPresent && shiftCode) {
      label = shiftCode.length <= 5 ? shiftCode : '✓';
    }

    return (
      <div className={`${BASE} ${config.bg} ${config.text}`} onClick={onClick} title={label}>
        {config.icon ? (
          <>
            <IconShield size={12} className="absolute top-0.5 right-0.5 opacity-70" />
            <span className="text-[10px] font-bold">GT</span>
          </>
        ) : (
          <span className="text-[11px] font-bold leading-none text-center px-0.5">{label}</span>
        )}
      </div>
    );
  }
);

NonPillBadge.displayName = 'NonPillBadge';