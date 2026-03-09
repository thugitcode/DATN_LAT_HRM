import { useWatch, type Control } from 'react-hook-form';

import { FormTimePicker } from '@/components/form-fields/form-time-picker';
import { calculateWorkingHours, calculateWorkingHoursOvernight, cn, formatDateVN, formatTime } from '@/lib/utils';

import { calculateTotalBreakTime } from '@/features/timekeeping-shift-scheduling/helper';
import dayjs from 'dayjs';
import type { shiftDetailsFormValues } from '../../schemas/shift-details.schema';
import type { AttendanceStatus } from '../../types/index.type';
import { AttendanceBadge } from './attendance-badge';
import { CheckInMethodEnum, type ShiftDetails } from './type';

interface ShiftDetailsCardProps {
  shift?: ShiftDetails;
  control: Control<shiftDetailsFormValues>;
}

export const ShiftDetailsCard = ({ shift, control }: ShiftDetailsCardProps) => {
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
    breaktime
  } = shift;
  const actualCheckIn = useWatch({ control, name: "actualCheckIn" })
  const actualCheckOut = useWatch({ control, name: "actualCheckOut" })
  // const actualCheckIn = watch("actualCheckIn")
  // const actualCheckOut = watch("actualCheckOut")

  const isLate = dayjs(actualCheckIn, "HH:mm")
    .isAfter(dayjs(shiftInfo?.startTime, "HH:mm:ss").add(shiftInfo?.allowedEarlyLeaveMinutes ?? 0, "minute"))
  const isEarly = dayjs(actualCheckOut, "HH:mm")
    .isBefore(dayjs(shiftInfo?.endTime, "HH:mm:ss").subtract(shiftInfo?.allowedLateMinutes ?? 0, "minute"))

  const newTotalWorkHours =
    (actualCheckIn && actualCheckOut
      ? calculateWorkingHoursOvernight(actualCheckIn, actualCheckOut, breaktime)
      : totalWorkHours).toFixed(2)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Top part: Dark blue */}
      <div className="bg-[#0A1A2F] px-4 py-3 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          {staff.avatar ? (
            <img src={staff.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-500 object-cover overflow-hidden">
              <img
                src="/images/avatar-default.png"
                alt="avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://ui-avatars.com/api/?name=' + staff.name + '&background=random';
                }}
              />
            </div>
          )}
          <div>
            <div className="font-semibold text-[15px]">{staff.name}</div>
            <div className="text-xs text-slate-300 font-light mt-0.5">
              Mã nhân viên: {staff.code}
            </div>
          </div>
        </div>
        <div className='text-end'>
          <div className="text-xs text-white font-medium truncate max-w-75">{departments?.map(it => it?.name)?.filter(Boolean)?.join(", ")}</div>
          <div className="text-xs text-slate-300 truncate max-w-75">{rooms?.map(it => it?.name)?.filter(Boolean)?.join(", ")}</div>
        </div>
      </div>

      {/* Bottom part: Shift and Times */}
      <div className="">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              {shiftInfo.name || 'Ca làm việc'}
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
            <span className="text-xs text-gray-400 w-26 text-start">Tổng giờ làm</span>
            <span className="text-[30px] font-medium w-25 leading-9">{newTotalWorkHours}</span>
          </div>
          <div className="flex items-center gap-1 ml-12">
            <span className="text-xs text-gray-400 w-26 text-start">Tổng giờ bù</span>
            <span className="text-[30px] font-medium text-gray-900 w-25 leading-9">
              {totalCompHours}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-gray-100 text-center border-t border-dashed border-gray-200 p-3">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400 w-26 text-start">Giờ vào</span>
            <FormTimePicker
              control={control}
              name="actualCheckIn"
              classInput={cn(isLate && "!text-danger", "!font-sans !font-medium text-[16px] w-22 !text-center")}
              isRequired
              showIcon={false}
            />
          </div>
          <div className="flex items-center gap-1 ml-12">
            <span className="text-xs text-gray-400 w-26 text-start">Giờ ra</span>
            <FormTimePicker
              control={control}
              name="actualCheckOut"
              classInput={cn(isEarly && "!text-danger","!font-medium !font-sans text-[16px] w-22 !text-center")}
              isRequired
              showIcon={false}
            />
          </div>
        </div>
        {/* - Nếu chấm bằng GPS: hiển thị địa điểm chấm
            - Nếu chấm bằng máy: hiển thị tên máy chấm công
            - Nếu chấm bằng faceId: hiển thị hình ảnh chấm công */}
        <div className="p-3 bg-[#F4F4F5]">
          <span className="text-[16px] text-gray-900 bg-[#F4F4F5] rounded-xl w-29">
            {attendance.checkInMethod === CheckInMethodEnum.GPS && `Địa điểm: ${attendance.checkOutLocation ?? ''}`}
            {attendance.checkInMethod === CheckInMethodEnum.MANUAL && `Tên máy: `}
          </span>
        </div>
      </div>
    </div>
  );
};
