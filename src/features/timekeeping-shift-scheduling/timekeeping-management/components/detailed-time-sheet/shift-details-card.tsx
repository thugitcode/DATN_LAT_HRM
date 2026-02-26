import { calculateCompHours, formatTime } from "@/lib/utils"
import { AttendanceBadge } from "./attendance-badge"
import { FormTimeInput } from "@/components/form-fields/form-time-input"


const totalWorkingHours = 8
export const ShiftDetailsCard = ({ shift, control }: any) => {
    const { staffAvatar, staffName, staffCode, departmentName, roomName, shiftName, shiftStartTime, shiftEndTime, dateLabel, typeLabel, actualCheckIn, actualCheckOut, totalWorkHours, totalActualWorkingHours, breakMinutes, location } = shift

    const overtimeHours = totalActualWorkingHours - totalWorkingHours
    return (<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Top part: Dark blue */}
        <div className="bg-[#0A1A2F] px-4 py-3 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
                {staffAvatar ? (
                    <img src={staffAvatar} alt="avatar" className="w-10 h-10 rounded-full" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-500 object-cover overflow-hidden">
                        <img src="/images/avatar-default.png" alt="avatar" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + staffName + '&background=random' }} />
                    </div>
                )}
                <div>
                    <div className="font-semibold text-[15px]">{staffName}</div>
                    <div className="text-xs text-slate-300 font-light mt-0.5">Mã nhân viên: {staffCode}</div>
                </div>
            </div>
            <div className="text-xs text-slate-300">{departmentName || roomName}</div>
        </div>

        {/* Bottom part: Shift and Times */}
        <div className="">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3">
                <div>
                    <h4 className="text-lg font-semibold text-gray-900">{shiftName || 'Ca làm việc'}</h4>
                    <div className="text-[13px] text-gray-500 mt-0.5">
                        {formatTime(shiftStartTime)} - {formatTime(shiftEndTime)}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-800">{dateLabel}</span>
                    <AttendanceBadge type={typeLabel} />
                </div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-gray-100 text-center border-t border-dashed border-gray-200 p-3">
                <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400 w-26 text-start">Tổng giờ làm
                    </span>
                    <span className="text-[30px] font-medium w-25 leading-9">
                        {totalActualWorkingHours}
                    </span>
                </div>
                <div className="flex items-center gap-1 ml-12">
                    <span className="text-xs text-gray-400 w-26 text-start">Tổng giờ bù</span>
                    <span className="text-[30px] font-medium text-gray-900 w-25 leading-9">
                        {calculateCompHours(overtimeHours, shift)}
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-gray-100 text-center border-t border-dashed border-gray-200 p-3">
                <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400 w-26 text-start">Giờ vào</span>
                        <FormTimeInput
                            control={control}
                            name="actualCheckIn"
                            isRequired
                            classNames={{
                                input: "flex justify-center", segment: "text-[16px] font-medium text-danger",
                                base: "[&_[role=spinbutton]]:text-danger [&_[role=spinbutton]]:font-medium w-29 [&[data-has-helper=true]]:pb-8"
                            }}
                        />
                        {/* {formatTime(actualCheckIn)} */}
                </div>
                <div className="flex items-center gap-1 ml-12">
                    <span className="text-xs text-gray-400 w-26 text-start">Giờ ra</span>
                    {/* <span className=" bg-[#F4F4F5] rounded-xl w-29"> */}
                        <FormTimeInput
                            control={control}
                            name="actualCheckOut"
                            isRequired
                            classNames={{
                                input: "flex justify-center", segment: "text-[16px] font-medium", base:"w-29 [&[data-has-helper=true]]:pb-8"
                            }}
                        />
                        {/* {formatTime(actualCheckIn)} */}
                    {/* </span> */}
                </div>
            </div>
            <div className="p-3 bg-[#F4F4F5]">
                <span className="text-[16px] text-gray-900 bg-[#F4F4F5] rounded-xl w-29">Địa điểm: {location ?? ""}</span>
            </div>
        </div>
    </div>)
}