import DataTable from "@/components/data-table/data-table";
import { useHistoryInterviewed } from "@/features/recruitment-management/recruitment-request-details/hooks/use-interview-schedule";
import type { ICandidate } from "@/features/recruitment-management/recruitment-request-details/types/type";
import { NAMESPACES } from "@/i18n/constants";
import { IconClockFilled } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useCandidateColumns } from "../../../hooks/use-columns";
const TABLE_CLASS_NAMES = { wrapper: 'h-[calc(100vh-369px)]' } as const;
export function HistoryTab({ candidate }: { candidate: ICandidate }) {
    const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT)
    const { columnsHistory } = useCandidateColumns()
    const { data: interviewHistory, isLoading } = useHistoryInterviewed(candidate.id)
    return (
        <div>
            <div className="flex items-center gap-2"><IconClockFilled /> <span className="font-medium text-lg leading-7">{t('candidate.detail.interview_history')}</span> </div>
            <DataTable
                columns={columnsHistory}
                dataSource={interviewHistory?.data || []}
                selectionMode="single"
                loading={isLoading}
                classNames={TABLE_CLASS_NAMES}
            />
        </div>
    );
}