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

/**
 * Detect ca đêm: checkIn > checkOut theo phút trong ngày
 * VD: checkIn = 21:53 (1313), checkOut = 07:05 (425) → cross midnight
 */
export function isCrossMidnight(checkInTime?: string | null, checkOutTime?: string | null): boolean {
    const iMin = parseMins(checkInTime);
    const oMin = parseMins(checkOutTime);
    if (iMin === null || oMin === null) return false;
    return iMin > oMin;
}

/**
 * Normalize phút tuyệt đối cho ca đêm.
 * Nếu là ca đêm, các giờ "nhỏ" (< shiftStartMins) thuộc ngày hôm sau → cộng 1440.
 */
export function toAbsoluteMins(
    time: string | null | undefined,
    shiftStartMins: number,
    crossMidnight: boolean,
): number | null {
    const m = parseMins(time);
    if (m === null) return null;
    if (crossMidnight && m < shiftStartMins) return m + 1440;
    return m;
}

export function formatTimeLabel(mins: number): string {
    const h = Math.floor(mins / 60) % 24; // wrap qua midnight
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function buildHourlySlots(
    segments: TimelineSegment[],
    startHour: number,
    endHour: number,
    crossMidnight = false,
): HourSlot[] {
    const PRIORITY = ['LATE', 'EARLY', 'FORGOT_TO_CLOCK_TIME'];
    const sorted = [
        ...segments.filter(s => PRIORITY.includes(s.type)),
        ...segments.filter(s => !PRIORITY.includes(s.type)),
    ];

    const shiftStartMins = startHour * 60;
    const slots: HourSlot[] = [];

    for (let h = startHour; h <= endHour; h++) {
        const slotStart = h * 60;
        const slotEnd = slotStart + 60;

        const match = sorted.find(seg => {
            const sMin = toAbsoluteMins(seg.startTime, shiftStartMins, crossMidnight);
            const eMin = toAbsoluteMins(seg.endTime, shiftStartMins, crossMidnight);
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

const LEAVE_LABEL_KL = 'KL';
const LEAVE_LABEL_PN = 'PN';

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

    const isLeavePN = timeline.some(item => item.type === ETimelineType.LEAVE && item.label === LEAVE_LABEL_PN);
    const isLeaveKL = timeline.some(item => item.type === ETimelineType.LEAVE && item.label === LEAVE_LABEL_KL);

    // ===== 1. Guard: special single-segment cases =====
    if (timeline.some(item => item.type === ETimelineType.WFH)) {
        return [{
            type: ETimelineType.WFH,
            label: t('shiftEntry.wfh'),
            startTime: checkInTime ?? '',
            endTime: checkOutTime ?? '',
            color: TIMELINE_COLOR_MAP[ETimelineType.WFH],
        }];
    }

    if (timeline.some(item => item.type === ETimelineType.BUSINESS_TRIP)) {
        return [{
            type: ETimelineType.BUSINESS_TRIP,
            label: t('shiftEntry.businessTrip'),
            startTime: checkInTime ?? '',
            endTime: checkOutTime ?? '',
            color: TIMELINE_COLOR_MAP[ETimelineType.BUSINESS_TRIP],
        }];
    }

    // ===== 2. Normalize LEAVE segments =====
    let normalizedTimeline: TimelineSegment[] = [];

    for (const item of timeline) {
        if (item.type !== ETimelineType.LEAVE) {
            normalizedTimeline.push(item);
            continue;
        }

        const leaveType = item.label === LEAVE_LABEL_KL
            ? ETimelineType.UNAUTHORIZED_LEAVE
            : ETimelineType.LEAVE;

        if (!checkInTime && !checkOutTime) {
            normalizedTimeline.push({ ...item, type: leaveType });
            continue;
        }

        const sMin = parseMins(item.startTime) ?? 0;
        const eMin = parseMins(item.endTime) ?? 0;
        const iMin = parseMins(checkInTime);
        const oMin = parseMins(checkOutTime);
        const baseItem = { ...item, type: leaveType };

        // Gap before check-in (nghỉ phép trước khi vào làm)
        if (iMin !== null && iMin - sMin > (allowedLateMinutes ?? 0)) {
            normalizedTimeline.push({ ...baseItem, endTime: checkInTime! });
        }

        // Work block trong ca nghỉ phép
        normalizedTimeline.push({
            ...baseItem,
            type: ETimelineType.WORK,
            label: 'Làm việc',
            startTime: (iMin !== null && iMin > sMin) ? checkInTime! : item.startTime,
            endTime: (oMin !== null && oMin < eMin) ? checkOutTime! : item.endTime,
            color: TIMELINE_COLOR_MAP[ETimelineType.WORK],
        });

        // Gap after check-out (nghỉ phép sau khi ra về)
        if (oMin !== null && oMin < eMin) {
            normalizedTimeline.push({ ...baseItem, startTime: checkOutTime! });
        }
    }

    // Lọc bỏ các khối có startTime === endTime
    normalizedTimeline = normalizedTimeline.filter(item => item.startTime !== item.endTime);

    // ===== 3. Adjust WORK boundaries for late/early =====
    const updatedTimeline = [...normalizedTimeline];

    if (hasLate && checkInTime) {
        const idx = updatedTimeline.findIndex(i => i.type === ETimelineType.WORK);
        if (idx !== -1) {
            updatedTimeline[idx] = { ...updatedTimeline[idx]!, startTime: checkInTime };
        }
    }

    if (hasEarly && checkOutTime) {
        const lastWorkIdx = updatedTimeline.map(i => i.type).lastIndexOf(ETimelineType.WORK);
        if (lastWorkIdx !== -1) {
            updatedTimeline[lastWorkIdx] = { ...updatedTimeline[lastWorkIdx]!, endTime: checkOutTime };
        }
    }

    // ===== 3.5. Cross-midnight: inject synthetic WORK for pre-midnight gap =====
    // API thường chỉ trả về segments của "ngày hôm sau" (VD: 01:00-07:00).
    // Nếu ca đêm và có khoảng trống giữa checkIn với segment đầu tiên → inject WORK.
    if (isCrossMidnight(checkInTime, checkOutTime) && checkInTime && updatedTimeline.length > 0) {
        const shiftStartAbsMins = parseMins(checkInTime)!;
        const firstSeg = updatedTimeline[0]!;
        const firstAbsStart = toAbsoluteMins(firstSeg.startTime, shiftStartAbsMins, true);
        if (firstAbsStart !== null && firstAbsStart > shiftStartAbsMins) {
            updatedTimeline.unshift({
                type: ETimelineType.WORK,
                label: 'Làm việc',
                startTime: checkInTime,
                endTime: firstSeg.startTime,
                color: TIMELINE_COLOR_MAP[ETimelineType.WORK],
            });
        }
    }

    const shiftStartTime = updatedTimeline[0]?.startTime ?? '';
    const shiftEndTime = updatedTimeline[updatedTimeline.length - 1]?.endTime ?? '';

    // ===== 4. Guard: VM / FORGOT (cần shiftStart/End nên đặt sau step 3) =====
    if (isMissingCheckIn && isMissingCheckOut && updatedTimeline.length > 0 && !isLeavePN && !isLeaveKL) {
        return [{
            type: ETimelineType.VM,
            label: t('shiftEntry.vm'),
            startTime: shiftStartTime,
            endTime: shiftEndTime,
            color: TIMELINE_COLOR_MAP[ETimelineType.VM],
        }];
    }

    if ((isMissingCheckIn || isMissingCheckOut) && updatedTimeline.length > 0 && !isLeavePN) {
        return [{
            type: ETimelineType.FORGOT_TO_CLOCK_TIME,
            label: t('shiftEntry.forgotClockTime'),
            startTime: checkInTime ?? shiftStartTime,
            endTime: checkOutTime ?? shiftEndTime,
            color: TIMELINE_COLOR_MAP[ETimelineType.FORGOT_TO_CLOCK_TIME],
        }];
    }

    // ===== 5. Build extra segments (late / early) =====
    const lateSegment: TimelineSegment | null = hasLate && checkInTime
        ? {
            type: ETimelineType.LATE,
            label: t('shiftEntry.late'),
            startTime: '',
            endTime: checkInTime,
            color: TIMELINE_COLOR_MAP[ETimelineType.LATE],
        }
        : null;

    const earlySegment: TimelineSegment | null = hasEarly && checkOutTime && !isLeaveKL
        ? {
            type: ETimelineType.EARLY,
            label: t('shiftEntry.early'),
            startTime: checkOutTime,
            endTime: shiftEndTime,
            color: TIMELINE_COLOR_MAP[ETimelineType.EARLY],
        }
        : null;

    // ===== 6. Compose: forgot → late → timeline → early =====
    return [
        ...(lateSegment ? [lateSegment] : []),
        ...updatedTimeline,
        ...(earlySegment ? [earlySegment] : []),
    ];
};