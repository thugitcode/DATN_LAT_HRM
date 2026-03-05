import { ShiftManagementGrid } from "@/features/timekeeping-shift-scheduling/shift-management/components/grid-layout/shift-management-grid";
import { useShiftManagementList } from "@/features/timekeeping-shift-scheduling/shift-management/hooks/use-shift-management";
import { LegendDot } from "@/features/timekeeping-shift-scheduling/timekeeping-management/components/timekeeping-management-legend";
import { useMonthDateRange } from "@/hooks/use-month-date-range";
import { useQueryFilter } from "@/hooks/useQueryFilter";
import type { ShiftManagementParams } from "@/types";
import { ShiftTypeEnum } from "@/types/shift-management.type";
import { useParams } from "@tanstack/react-router";

export const ShiftManagementContainer = () => {
    const { id } = useParams({ strict: false })
    const { filters } = useQueryFilter<ShiftManagementParams>();

    const { startDate, endDate } = useMonthDateRange(filters.month);
    const SHIFT_CA_LEGEND = [
        {
            label: 'Ca cố định',
            color: '#006FEE',
            status: ShiftTypeEnum.FIXED,
            number: 4
        },
        {
            label: 'Ca gãy',
            color: '#F5A524',
            status: ShiftTypeEnum.SPLIT,
            number: 4
        },
        {
            label: 'Ca trực',
            color: '#7828C8',
            status: ShiftTypeEnum.ON_DUTY,
            number: 4
        },
        {
            label: 'Ca linh hoạt',
            color: '#17C964',
            status: ShiftTypeEnum.FLEXIBLE,
            number: 4
        },
        {
            label: 'Nghỉ',
            color: '#F4F4F5',
            status: null,
            number: 4
        },
    ];
    const { data, isLoading } = useShiftManagementList({
        page: filters.page ?? 1,
        limit: filters.limit ?? 10,
        startDate,
        endDate,
        search: filters.search,
        departmentId: filters.departmentId,
        roomId: filters.roomId,
        staffId: id
    });

    const StatsSection = ({ stats }) => {
        return (
            <div className="flex px-6 py-[12.5px] border-r-1 border-[#11111126]">
                <div className="px-3 py-1.5 flex items-center gap-1 w-38.5 justify-between">
                    <div className="flex items-center gap-1">
                        <LegendDot color={stats?.color} shape="circle" />
                        <span className="leading-5 text-[14px]">{stats?.label ?? ""}</span>
                    </div>
                    <span className="text-2xl font-medium">{stats?.number ?? 0}</span>
                </div>
            </div>

        )
    }
    return (
        <>
            <div className="flex bg-white mb-5 rounded-b-xl py-1.5">
                {SHIFT_CA_LEGEND.map(item => <StatsSection stats={item} />)}
            </div>
            <ShiftManagementGrid data={data?.data} isLoading={isLoading} height="h-[calc(100vh-480px)] bg-white" />
        </>
    )
}