import { EMPTY_COLOR, EMPTY_TYPE } from "./contants/data"
import type { HourSlot, MergedSlot, TimelineSegment, TimelineType } from "./types"

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