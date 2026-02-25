import { useMemo, useState } from 'react';
import { Button } from '@heroui/react';

import { PageContainer } from '@/components/page-container';
import { TitlePage } from '@/components/title-page';
import { useCommonTable } from '@/hooks/common/use-common-table';
import { attendanceExplanationListQueryOptions } from '@/hooks/use-attendance-explanation';
import type { AttendanceExplanationFilters } from '@/types/attendance-explanation.type';

import { ExplanationFilter } from './components/explanation-filter';
import { ExplanationSummaryCard } from './components/explanation-summary';
import { ExplanationTable } from './components/explanation-table';

export const ExplanationManagement = () => {
    const [filters, setFilters] = useState<AttendanceExplanationFilters>({
        fromDate: undefined,
        toDate: undefined,
    });

    const table = useCommonTable({
        queryOptions: attendanceExplanationListQueryOptions,
        defaultFilters: filters,
        defaultPagination: {
            page: 1,
            limit: 25,
        },
    });

    const summary = useMemo(() => {
        return table.meta || {
            totalRequests: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            byType: [],
        };
    }, [table.meta]);

    const handleFiltersChange = (newFilters: AttendanceExplanationFilters) => {
        setFilters(newFilters);
        table.onFilters(newFilters);
    };

    const handleBulkApprove = () => {
        // TODO: Implement bulk approve
        console.log('Bulk approve:', table.selectedRecords);
    };

    return (
        <PageContainer className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <TitlePage title="Quản lý giải trình ca" />
                <Button
                    color="primary"
                    className="h-10 px-4 font-medium"
                    isDisabled={table.selectedRecords.length === 0}
                    onPress={handleBulkApprove}
                >
                    Xác nhận
                </Button>
            </div>

            {/* Filters */}
            <ExplanationFilter
                filters={filters}
                onFiltersChange={handleFiltersChange}
            />

            {/* Summary */}
            <ExplanationSummaryCard
                summary={summary}
                explanationTypes={summary.byType}
            />

            {/* Table */}
            <ExplanationTable
                data={table.data}
                loading={table.loading}
                page={table.page}
                limit={table.limit}
                total={table.total}
                onPageChange={table.setPage}
                onLimitChange={table.setLimit}
                selectedRecords={table.selectedRecords}
                onSelectionChange={table.setSelectedRecords}
                onRefresh={table.refetch}
            />
        </PageContainer>
    );
};
