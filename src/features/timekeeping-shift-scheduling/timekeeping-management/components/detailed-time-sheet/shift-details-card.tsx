import { NAMESPACES } from '@/i18n/constants';
import dayjs from 'dayjs';
import { useWatch, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { calculateWorkingHoursOvernight, cn, formatDateVN, formatTime } from '@/lib/utils';
import { FormTimePicker } from '@/components/form-fields/form-time-picker';

import type { shiftDetailsFormValues } from '../../schemas/shift-details.schema';
import type { AttendanceStatus } from '../../types/index.type';
import { AttendanceBadge } from './attendance-badge';
import { CheckInMethodEnum, type ShiftDetails } from './type';
import { StaffAvatar } from '@/features/timekeeping-shift-scheduling/components/staff-avatar';

interface ShiftDetailsCardProps {
  shift?: ShiftDetails;
  control: Control<shiftDetailsFormValues>;
}

export const ShiftDetailsCard = ({ shift, control }: ShiftDetailsCardProps) => {
  const { t } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);

  const actualCheckIn = useWatch({ control, name: 'actualCheckIn' });

  const actualCheckOut = useWatch({ control, name: 'actualCheckOut' });

  if (!shift) return null;

  const {
    staff,
    shift: shiftInfo,
    attendance,
    workDate,
    totalWorkHours,
    totalCompHours,
    departments,
    rooms,
    displayCode,
    breaktime,
  } = shift;

  const isLate = dayjs(actualCheckIn, 'HH:mm').isAfter(
    dayjs(shiftInfo?.startTime, 'HH:mm:ss').add(shiftInfo?.allowedEarlyLeaveMinutes ?? 0, 'minute'),
  );
  const isEarly = dayjs(actualCheckOut, 'HH:mm').isBefore(
    dayjs(shiftInfo?.endTime, 'HH:mm:ss').subtract(shiftInfo?.allowedLateMinutes ?? 0, 'minute'),
  );

  const newTotalWorkHours = (
    actualCheckIn && actualCheckOut
      ? calculateWorkingHoursOvernight(actualCheckIn, actualCheckOut, breaktime)
      : totalWorkHours
  ).toFixed(2);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header — dark blue */}
      <div className="bg-[#0A1A2F] px-4 py-3 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StaffAvatar avatarUrl={staff.avatar} name={staff.name} />
          <div>
            <div className="font-semibold text-[15px]">{staff.name}</div>
            <div className="text-xs text-slate-300 font-light mt-0.5">
              {t('shift_details.card.employee_code')}: {staff.code}
            </div>
          </div>
        </div>
        <div className="text-end">
          <div className="text-xs text-white font-medium truncate max-w-75">
            {departments
              ?.map((it) => it?.name)
              ?.filter(Boolean)
              ?.join(', ')}
          </div>
          <div className="text-xs text-slate-300 truncate max-w-75">
            {rooms
              ?.map((it) => it?.name)
              ?.filter(Boolean)
              ?.join(', ')}
          </div>
        </div>
      </div>

      {/* Body */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              {shiftInfo.name || t('shift_details.card.default_shift_name')}
            </h4>
            <div className="text-[13px] text-gray-500 mt-0.5">
              {formatTime(shiftInfo?.startTime)} - {formatTime(shiftInfo?.endTime)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-800">{formatDateVN(workDate)}</span>
            <AttendanceBadge type={displayCode as AttendanceStatus} />
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-gray-100 text-center border-t border-dashed border-gray-200 p-3">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400 w-26 text-start">
              {t('shift_details.card.total_work_hours')}
            </span>
            <span className="text-[30px] font-medium w-25 leading-9">{newTotalWorkHours}</span>
          </div>
          <div className="flex items-center gap-1 ml-12">
            <span className="text-xs text-gray-400 w-26 text-start">
              {t('shift_details.card.total_comp_hours')}
            </span>
            <span className="text-[30px] font-medium text-gray-900 w-25 leading-9">
              {totalCompHours}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-gray-100 text-center border-t border-dashed border-gray-200 p-3">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400 w-26 text-start">
              {t('shift_details.card.check_in')}
            </span>
            <FormTimePicker
              control={control}
              name="actualCheckIn"
              classInput={cn(
                isLate && '!text-danger',
                '!font-sans !font-medium text-[16px] w-22 !text-center',
              )}
              isRequired
              showIcon={false}
            />
          </div>
          <div className="flex items-center gap-1 ml-12">
            <span className="text-xs text-gray-400 w-26 text-start">
              {t('shift_details.card.check_out')}
            </span>
            <FormTimePicker
              control={control}
              name="actualCheckOut"
              classInput={cn(
                isEarly && '!text-danger',
                '!font-medium !font-sans text-[16px] w-22 !text-center',
              )}
              isRequired
              showIcon={false}
            />
          </div>
        </div>

        <div className="p-3 bg-[#F4F4F5]">
          <span className="text-[16px] text-gray-900 bg-[#F4F4F5] rounded-xl w-29">
            {attendance.checkInMethod === CheckInMethodEnum.GPS &&
              `${t('shift_details.card.location')}: ${attendance.checkOutLocation ?? ''}`}
            {attendance.checkInMethod === CheckInMethodEnum.MANUAL &&
              `${t('shift_details.card.machine_name')}: `}
          </span>
        </div>
      </div>
    </div>
  );
};
