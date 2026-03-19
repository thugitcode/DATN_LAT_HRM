import { ShiftManagementGrid } from "@/features/timekeeping-shift-scheduling/shift-management/components/grid-layout/shift-management-grid";
import { useShiftManagementGrid } from "@/features/timekeeping-shift-scheduling/shift-management/hooks/use-shift-management";
import { LegendDot } from "@/features/timekeeping-shift-scheduling/timekeeping-management/components/timekeeping-management-legend";
import { useMonthDateRange } from "@/hooks/use-month-date-range";
import { useQueryFilter } from "@/hooks/useQueryFilter";
import { NAMESPACES } from "@/i18n/constants";
import { cn } from "@/lib/utils";
import type { ShiftManagementParams } from "@/types";
import { ShiftTypeEnum } from "@/types/shift-management.type";
import { useParams } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const ShiftManagementContainer = ({ staffId }: { staffId?: string }) => {
    const { id } = useParams({ strict: false })
    const { filters } = useQueryFilter<ShiftManagementParams>();
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);

    const { startDate, endDate } = useMonthDateRange(filters.month);


    const { data, isLoading } = useShiftManagementGrid({
        page: filters.page ?? 1,
        limit: filters.limit ?? 10,
        startDate,
        endDate,
        search: filters.search,
        departmentId: filters.departmentId,
        roomId: filters.roomId,
        staffId: id ?? staffId
    });

    // 1. Định nghĩa cấu hình màu sắc/meta cho từng loại ca
    const SHIFT_CONFIG = {
        [ShiftTypeEnum.FIXED]: { color: '#006FEE' },
        [ShiftTypeEnum.SPLIT]: { color: '#F5A524' },
        [ShiftTypeEnum.ON_DUTY]: { color: '#7828C8' },
        [ShiftTypeEnum.FLEXIBLE]: { color: '#17C964' },
    };

    // 2. Map dữ liệu từ Enum để tạo ra Legend
    const SHIFT_CA_LEGEND = Object.values(ShiftTypeEnum).map((status) => {
        const config = SHIFT_CONFIG[status];
        const count = (data?.data?.shiftTypesCount)?.[status] || 0;

        return {
            label: t(`shift_type.${status}`), // Map key từ i18n
            color: config.color,
            status: status,
            number: count as number
        };
    });
    const StatsSection = ({ stats }: { stats: { label: string; color: string; number: number } }) => {
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
            <ShiftManagementGrid data={data?.data?.data} isLoading={isLoading} height={cn(staffId ? 'h-[calc(100vh-360px)]' : "h-[calc(100vh-480px)]", " bg-white")} />
        </>
    )
}