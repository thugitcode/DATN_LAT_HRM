import type { TimelineType } from "./types"

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
    LATE: "#F31260",  // Màu hồng/đỏ (Muộn/Khác)
    EARLY: "#F31260",  // Màu hồng/đỏ (Muộn/Khác)
};