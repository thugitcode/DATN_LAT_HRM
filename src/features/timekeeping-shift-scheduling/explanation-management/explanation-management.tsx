import { Button } from '@heroui/react';

import { PageContainer } from '@/components/page-container';
import { TitlePage } from '@/components/title-page';

import { ExplanationFilter } from './components/explanation-filter';
import { ExplanationSummaryCard } from './components/explanation-summary';
import { ExplanationTable } from './components/explanation-table';
import {
    mockExplanationData,
    mockExplanationTypes,
    mockSummary,
} from './constants/data';

export const ExplanationManagement = () => {
    return (
        <PageContainer className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <TitlePage title="Quản lý giải trình ca" />
                <Button color="primary" className="h-10 px-4 font-medium">
                    Xác nhận
                </Button>
            </div>

            {/* Filters */}
            <ExplanationFilter />

            {/* Summary */}
            <ExplanationSummaryCard
                summary={mockSummary}
                explanationTypes={mockExplanationTypes}
            />

            {/* Table */}
            <ExplanationTable data={mockExplanationData} />
        </PageContainer>
    );
};
