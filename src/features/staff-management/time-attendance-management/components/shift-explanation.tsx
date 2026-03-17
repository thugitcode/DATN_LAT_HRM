import DataTable from "@/components/data-table/data-table";
import { DEFAULT_SUMMARY } from "@/features/timekeeping-shift-scheduling/accountability-management/accountability-management";
import { ExplanationSummary } from "@/features/timekeeping-shift-scheduling/accountability-management/components/explanation-summary";
import { useAccountabilityManagementList } from "@/features/timekeeping-shift-scheduling/accountability-management/hooks/use-approve-accountability";
import { useColumns } from "@/features/timekeeping-shift-scheduling/accountability-management/hooks/use-columns";
import type { AttendanceExplanationFilters } from "@/features/timekeeping-shift-scheduling/accountability-management/types";
import { useMonthDateRange } from "@/hooks/use-month-date-range";
import { useQueryFilter } from "@/hooks/useQueryFilter";
import { PAGE_SIZE_OPTIONS } from "@/lib/utils";
import type { Selection } from "@heroui/react";
import { useParams } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";


export const ShiftExplanation = ({ staffId }: { staffId?: string }) => {
    const { id } = useParams({ strict: false })
    const { filters } = useQueryFilter<AttendanceExplanationFilters>();
    const { departmentId, month, roomId, search, status, type, page, limit } = filters;
    const { startDate, endDate } = useMonthDateRange(filters.month);
    const { columns } = useColumns();

    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
    const handleSelectionChange = useCallback((keys: Selection) => {
        setSelectedKeys(keys);
    }, []);
    const { data, isLoading } = useAccountabilityManagementList({
        staffId: id ?? staffId,
        fromDate: startDate,
        toDate: endDate,
        departmentId,
        roomId,
        search,
        status,
        type,
        page,
        limit,
    });
    const summary = useMemo(() => data?.metadata ?? DEFAULT_SUMMARY, [data]);
    return (
        <div className="flex flex-col gap-5">
            <ExplanationSummary showLabel={false} summary={summary} explanationTypes={summary.byType} />

            <DataTable
                dataSource={data?.data ?? []}
                columns={columns}
                loading={isLoading}
                selectedKeys={selectedKeys}
                onSelectionChange={handleSelectionChange}
                classNames={{ wrapper: staffId?'h-[calc(100vh-445px)]':'h-[calc(100vh-565px)]' }}
                pagination={{
                    current: Number(filters.page),
                    showSizeChanger: true,
                    pageSizeOptions: PAGE_SIZE_OPTIONS,
                    total: data?.pagination?.total,
                    pageSize: Number(filters.limit),
                    totalPage: data?.pagination?.totalPage,
                }}
            />
        </div>
    )
}