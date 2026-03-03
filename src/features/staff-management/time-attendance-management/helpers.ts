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