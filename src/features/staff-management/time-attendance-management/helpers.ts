import { EMPTY_COLOR, EMPTY_TYPE } from "./contants/data"
import { ETimelineType, type ConvertTimelineInput, type HourSlot, type MergedSlot, type TimelineSegment, type TimelineType } from "../types/types"

type TimeSlot = {
    time: string
    label: string
    color: string
}
type TimeSlotExtra = TimeSlot & { count: number; startIndex: number; }

export function groupTimeSlots(slots: TimeSlot[]) {
    if (!slots.length) return []

    const result: (TimeSlotExtra)[] = []
    let current = { ...slots[0], count: 1, startIndex: 0 }

    for (let i = 1; i < slots.length; i++) {
        const slot = slots[i]

        if (slot?.label === current.label) {
            current.count++
        } else {
            result.push(current as TimeSlotExtra)
            current = { ...slot, count: 1, startIndex: i }
        }
    }

    result.push(current as TimeSlotExtra)
    return result
}

export const translateJobTitle = (title: string) => {
    const titles: Record<string, string> = {
        'DOCTOR': 'Bác sĩ',
        'NURSE': 'Điều dưỡng',
        'TECHNICIAN': 'Kỹ thuật viên',
        'MIDWIFE': 'Hộ sinh',
        'PHYSICIAN_ASSISTANT': 'Y sĩ',
        'OFFICE_STAFF': 'Nhân viên văn phòng',
        'MANAGEMENT': 'Quản lý',
        'LAB_TECHNICIAN': 'Kỹ thuật viên xét nghiệm',
        'IMAGING_TECHNICIAN': 'Kỹ thuật viên chẩn đoán hình ảnh',
        'CASHIER': 'Thu ngân',
        'RECEPTIONIST': 'Lễ tân',
        'WAREHOUSE_KEEPER': 'Thủ kho',
        'PHARMACIST': 'Dược sĩ',
        'SALES': 'Sale',
        'TELESALES': 'Telesale',
        'MARKETING': 'Marketing',
        'CUSTOMER_SUPPORT': 'Chăm sóc khách hàng',
        'MARKETING_LEAD': 'Trưởng nhóm marketing',
        'CUSTOMER_SUPPORT_LEAD': 'Trưởng nhóm CSKH',
    };
    return titles[title] || title || '—';
};

export const translatePosition = (position: string) => {
    const positions: Record<string, string> = {
        'STAFF': 'Nhân viên',
        'HEAD_OF_DEPARTMENT': 'Trưởng khoa',
        'DEPUTY_HEAD_OF_DEPARTMENT': 'Phó khoa',
        'CHIEF_NURSE': 'Điều dưỡng trưởng',
        'MANAGER': 'Trưởng phòng',
        'HEAD_OF_UNIT': 'Trưởng bộ phận',
        'DEPUTY_MANAGER': 'Phó phòng',
    };
    return positions[position] || position || '—';
};


export const TIMELINE_COLOR_MAP: Record<TimelineType, string> = {
    WORK: "#3874B8",   // Màu xanh dương nhạt (Làm việc)
    BREAK: "#ECECEC",  // Màu xám nhạt (Nghỉ trưa)
    OT: "#006FEE",     // Màu xanh dương đậm (OT)
    LEAVE: "#F5A524",  // Màu cam (Nghỉ phép)
    OTHER: "#F31260",  // Màu hồng/đỏ (Muộn/Khác)
    LATE: "#D55829",
    EARLY: "#73C9C6",
    UNAUTHORIZED_LEAVE: "#F31260",  // Màu hồng/đỏ (Muộn/Khác)
    FORGOT_TO_CLOCK_TIME: "#17C964",  // Màu xanh lá (Quên check in/out),
    WFH: "#9DCAFF",
    BUSINESS_TRIP: "#F5A524",
    VM: "#9734EE",
};


export function parseMins(time?: string | null): number | null {
    if (!time) return null;
    const match = time.match(/(\d+):(\d+)/);
    if (!match) return null;
    let hh = parseInt(match[1] || '0', 10);
    const mm = parseInt(match[2] || '0', 10);
    const lower = time.toLowerCase();
    if (lower.includes('pm') && hh < 12) hh += 12;
    if (lower.includes('am') && hh === 12) hh = 0;
    return hh * 60 + mm;
}

export function formatTimeLabel(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function buildHourlySlots(segments: TimelineSegment[], startHour: number, endHour: number): HourSlot[] {
    const PRIORITY = ['LATE', 'EARLY', 'FORGOT_TO_CLOCK_TIME'];
    const sorted = [
        ...segments.filter(s => PRIORITY.includes(s.type)),
        ...segments.filter(s => !PRIORITY.includes(s.type)),
    ];

    const slots: HourSlot[] = [];

    for (let h = startHour; h <= endHour; h++) {
        const slotStart = h * 60;
        const slotEnd = slotStart + 60;

        const match = sorted.find(seg => {
            const sMin = parseMins(seg.startTime);
            const eMin = parseMins(seg.endTime);
            const effectiveStart = sMin !== null ? sMin : (eMin !== null ? 0 : null);
            const effectiveEnd = eMin !== null && eMin !== 0 ? eMin : 24 * 60;
            if (effectiveStart === null) return false;
            return effectiveStart < slotEnd && effectiveEnd > slotStart;
        });

        slots.push({
            hour: h,
            type: match ? match.type : EMPTY_TYPE,
            color: match ? (TIMELINE_COLOR_MAP[match.type] ?? match.color) : EMPTY_COLOR,
            segment: match,
        });
    }

    return slots;
}

export function mergeConsecutiveSlots(slots: HourSlot[]): MergedSlot[] {
    if (!slots.length) return [];
    const merged: MergedSlot[] = [];

    let currentGroup: HourSlot[] = [slots[0]!];

    for (let i = 1; i < slots.length; i++) {
        const s = slots[i]!;
        if (s.type === currentGroup[0]!.type) {
            currentGroup.push(s);
        } else {
            merged.push(createMergedSlot(currentGroup));
            currentGroup = [s];
        }
    }
    merged.push(createMergedSlot(currentGroup));
    return merged;
}

export function createMergedSlot(group: HourSlot[]): MergedSlot {
    const first = group[0]!;
    const last = group[group.length - 1]!;

    let labelStart = formatTimeLabel(first.hour * 60);
    let labelEnd = formatTimeLabel((last.hour + 1) * 60);

    if (first.segment && first.segment.startTime) {
        const m = parseMins(first.segment.startTime);
        if (m !== null) labelStart = formatTimeLabel(m);
    }

    if (last.segment && last.segment.endTime) {
        const m = parseMins(last.segment.endTime);
        if (m !== null) labelEnd = formatTimeLabel(m);
    }

    return {
        type: first.type,
        color: first.color,
        span: group.length,
        hourStart: first.hour,
        labelStart,
        labelEnd,
    };
}

export const convertTimeLine = ({
    timeline,
    lateMinutes,
    earlyMinutes,
    checkInTime,
    checkOutTime,
    allowedLateMinutes,
    t,
}: ConvertTimelineInput): TimelineSegment[] => {
    const hasLate = lateMinutes > 0;
    const hasEarly = earlyMinutes > 0;
    const isMissingCheckIn = !checkInTime;
    const isMissingCheckOut = !checkOutTime;

    // ===== 1. Normalize data (rule business) =====
    let normalizedTimeline: TimelineSegment[] = [];

    // Process LEAVE KL specifically
    for (const item of timeline) {
        if (item.type === 'LEAVE') {
            const hasCheckIn = !!checkInTime;
            const hasCheckOut = !!checkOutTime;
            const type = item.label === 'KL' ? ETimelineType.UNAUTHORIZED_LEAVE : ETimelineType.LEAVE;
            if (hasCheckIn || hasCheckOut) {
                // const parseMins = (str?: string | null) => {
                //   if (!str) return null;
                //   let hh = 0, mm = 0;
                //   const match = str.match(/(\d+):(\d+)/);
                //   if (match) {
                //     hh = parseInt(match[1] || '0', 10);
                //     mm = parseInt(match[2] || '0', 10);
                //   }
                //   if (str.toLowerCase().includes('pm') && hh < 12) hh += 12;
                //   // handle the "12:xx AM" edge case where it means noon
                //   if (str.toLowerCase().includes('am') && hh === 12) hh = 12;
                //   return hh * 60 + mm;
                // };

                const sMin = parseMins(item.startTime) ?? 0;
                const eMin = parseMins(item.endTime) ?? 0;
                const iMin = parseMins(checkInTime);
                const oMin = parseMins(checkOutTime);

                const baseItem = { ...item, type: type };

                // Gap before Check-in
                if (iMin !== null && iMin - sMin > (allowedLateMinutes ?? 0)) {
                    normalizedTimeline.push({ ...baseItem, endTime: checkInTime! });
                }

                // Work block
                const wStart = (iMin !== null && iMin > sMin) ? checkInTime! : item.startTime;
                const wEnd = (oMin !== null && oMin < eMin) ? checkOutTime! : item.endTime;

                normalizedTimeline.push({
                    ...baseItem,
                    type: ETimelineType.WORK,
                    label: 'Làm việc',
                    startTime: wStart,
                    endTime: wEnd,
                    color: '#3874B8',
                });

                // Gap after Check-out
                if (oMin !== null && oMin < eMin) {
                    normalizedTimeline.push({ ...baseItem, startTime: checkOutTime! });
                }

                continue;
            }

            normalizedTimeline.push({
                ...item,
                type: type,
            });
            continue;
        }
        normalizedTimeline.push(item);
    }

    // Lọc bỏ các khối trùng bắt đầu/kết thúc do chia khối
    normalizedTimeline = normalizedTimeline.filter(item => item.startTime !== item.endTime);

    // ===== 2. Update WORK segments =====
    const updatedTimeline = [...normalizedTimeline];

    // đi muộn → sửa WORK đầu
    if (hasLate && checkInTime) {
        const idx = updatedTimeline.findIndex((i) => i.type === 'WORK');
        if (idx !== -1) {
            updatedTimeline[idx] = {
                ...updatedTimeline[idx],
                startTime: checkInTime,
            } as TimelineSegment;
        }
    }

    // về sớm → sửa WORK cuối
    if (hasEarly && checkOutTime) {
        const reverseIdx = [...updatedTimeline]
            .reverse()
            .findIndex((i) => i.type === 'WORK');

        if (reverseIdx !== -1) {
            const realIdx = updatedTimeline.length - 1 - reverseIdx;
            updatedTimeline[realIdx] = {
                ...updatedTimeline[realIdx],
                endTime: checkOutTime,
            } as TimelineSegment;
        }
    }

    // Derive actual shift start/end times from normalized timeline
    const shiftStartTime = updatedTimeline[0]?.startTime ?? '';
    const shiftEndTime = updatedTimeline[updatedTimeline.length - 1]?.endTime ?? '';

    // ===== 3. Build extra segments =====
    const extraSegments: TimelineSegment[] = [];

    // quên chấm công
    const isLeavePN = timeline.some(item => item.type === 'LEAVE' && item.label === 'PN');
    const isLeaveKL = timeline.some(item => item.type === 'LEAVE' && item.label === 'KL');
    if ((isMissingCheckIn || isMissingCheckOut) && updatedTimeline.length > 0 && !isLeavePN) {
        extraSegments.push({
            type: ETimelineType.FORGOT_TO_CLOCK_TIME,
            label: t('shiftEntry.forgotClockTime'),
            startTime: checkInTime ?? shiftStartTime,
            endTime: checkOutTime ?? shiftEndTime,
            color: '#F59E0B',
        });
    }

    // late
    if (hasLate && checkInTime) {
        extraSegments.push({
            type: ETimelineType.LATE,
            label: t('shiftEntry.late'),
            startTime: '',
            endTime: checkInTime,
            color: '#EF4444',
        });
    }

    // early
    if (hasEarly && checkOutTime && !isLeaveKL) {
        extraSegments.push({
            type: ETimelineType.EARLY,
            label: t('shiftEntry.early'),
            startTime: checkOutTime,
            endTime: shiftEndTime,  // actual shift end, not empty
            color: '#EF4444',
        });
    }

    // ===== 4. Compose final timeline =====
    const result: TimelineSegment[] = [
        // ưu tiên hiển thị: forgot → late → timeline → early
        ...extraSegments.filter(i => i.type === ETimelineType.FORGOT_TO_CLOCK_TIME),
        ...extraSegments.filter(i => i.type === ETimelineType.LATE),
        ...updatedTimeline,
        ...extraSegments.filter(i => i.type === ETimelineType.EARLY),
    ];
    if (timeline.some(item => item.type === 'WFH')) {
        return [{
            type: ETimelineType.WFH,
            label: t('shiftEntry.wfh'),
            startTime: checkInTime ?? shiftStartTime,
            endTime: checkOutTime ?? shiftEndTime,
            color: '#F59E0B',
        }];
    }
    if (timeline.some(item => item.type === 'BUSINESS_TRIP')) {
        return [{
            type: ETimelineType.BUSINESS_TRIP,
            label: t('shiftEntry.businessTrip'),
            startTime: checkInTime ?? shiftStartTime,
            endTime: checkOutTime ?? shiftEndTime,
            color: '#F5A524',
        }];
    }
    if ((isMissingCheckIn && isMissingCheckOut) && updatedTimeline.length > 0 && !isLeavePN && !isLeaveKL) {
        return [{
            type: ETimelineType.VM,
            label: t('shiftEntry.vm'),
            startTime: checkInTime ?? shiftStartTime,
            endTime: checkOutTime ?? shiftEndTime,
            color: '#9734EE',
        }];
    }
    if ((isMissingCheckIn || isMissingCheckOut) && updatedTimeline.length > 0 && !isLeavePN) {
        return [{
            type: ETimelineType.FORGOT_TO_CLOCK_TIME,
            label: t('shiftEntry.forgotClockTime'),
            startTime: checkInTime ?? shiftStartTime,
            endTime: checkOutTime ?? shiftEndTime,
            color: '#F59E0B',
        }];
    }
    // ===== 5. Normalize time format =====
    return result
};