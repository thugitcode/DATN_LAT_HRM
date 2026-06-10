
import { useCandidateDetail } from '@/hooks/queries/use-candidate-query';

import { DetailCandidateTabEnum } from '@/features/recruitment-management/constants/details';
import { CandidateDetailHeader } from './candidate-detail-header';
import { CandidateDetailTabs } from './candidate-detail-tabs';
import { CandidateSidebar } from './candidate-sidebar';
import { LoadingWrapper } from '@/components/loading-wrapper';

interface CandidateDetailsProps {
    id: string;
    tab: DetailCandidateTabEnum;
    onTabChange: (tab: DetailCandidateTabEnum) => void;
}

export function CandidateDetails({ id, tab, onTabChange }: CandidateDetailsProps) {
    const { data: res, isLoading } = useCandidateDetail(id);
    const candidate = res?.data;

    if (isLoading) {
        return (
            <LoadingWrapper isLoading={isLoading} height='50vh'>
                <></>
            </LoadingWrapper>
        );
    }

    if (!candidate) return null;

    return (
        <div className="flex flex-col h-full bg-[#F8F8F9]">
            <CandidateDetailHeader candidate={candidate} />

            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-4">
                    {/* <CandidatePipeline candidate={candidate} /> */}
                    <CandidateDetailTabs
                        candidate={candidate}
                        activeTab={tab}
                        onTabChange={onTabChange}
                    />
                </div>

                <CandidateSidebar candidate={candidate} />
            </div>
        </div>
    );
}
