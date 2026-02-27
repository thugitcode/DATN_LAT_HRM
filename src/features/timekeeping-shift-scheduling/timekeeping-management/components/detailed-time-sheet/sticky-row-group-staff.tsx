import { getInitials } from "@/features/timekeeping-shift-scheduling/helper"
import { cn } from "@/lib/utils"
import { IconCaretRightFilled } from "@tabler/icons-react"
import type { FlatRow } from "../../types/index.type"
import { STAFF_POSITION } from "@/features/timekeeping-shift-scheduling/shift-management/constants/data"
import type { StaffPosition } from "@/types/global.type"

export const StickyRowGroupStaff = ({ toggleGroup, row }: { toggleGroup: (id: string) => void, row: FlatRow }) => {
    if (row.type !== "group") return null
    
    return (
        <div
            className="flex w-full items-center gap-3 cursor-pointer px-4 py-2 bg-[#E4E4E7] hover:bg-accent transition-colors"
            onClick={() => toggleGroup(row.staff.code)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    toggleGroup(row.staff.code)
                }
            }}
        >
            <IconCaretRightFilled
                className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    row.isExpanded && "rotate-90"
                )}
            />
            <div className="text-sm font-medium">{row.index}</div>

            <div className="flex items-center gap-3 pl-4 w-85">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {getInitials(row.staff.name)}
                </div>
                <div className="flex flex-col gap-0.5">
                    <div className="text-sm font-medium text-foreground">
                        {row.staff.name} - {row.staff.code}
                    </div>
                    <div className="text-sm font-medium text-gray-600">{STAFF_POSITION?.[row.staff.position as StaffPosition]}</div>
                </div>
            </div>

            <div className="flex flex-col gap-0.5 pl-8">
                <div className="text-sm font-medium text-foreground">{row.staff.department}</div>
                <div className="text-sm font-medium text-gray-600">{row.staff.room}</div>
            </div>
        </div>
    )
}