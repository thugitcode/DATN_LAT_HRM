import { Button, Spinner, Tab, Tabs } from '@heroui/react';
import { IconArrowLeft, IconCalendar, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';
import { cn } from '@/lib/utils';
import { recruitmentRequestQueryOptions } from '@/services/query-options/recruitment-request.query';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { RecruitmentRequestStatusEnum } from '../recruitment-request-list/types/type';
import { CandidateKanban } from './components/candidate-kanban';
import { InterviewCalendar } from '../interview-schedule/components/interview-calender';
import { RecruitmentInformationSection } from './components/recruitment-information-section';
import { RecruitmentRequestTabEnum } from './constants/data';
import { useCandidateList } from './hooks/use-candidate-list';
import { LoadingWrapper } from '@/components/loading-wrapper';

type TabKey = RecruitmentRequestTabEnum;

interface RecruitmentRequestDetailsProps {
    id: string;
    tab?: TabKey;
    onBack?: () => void;
    onClose?: () => void;
    currentIndex?: number;
    total?: number;
    onPrev?: () => void;
    onNext?: () => void;
}

const STATUS_COLOR: Record<RecruitmentRequestStatusEnum, { text: string; bg: string }> = {
    [RecruitmentRequestStatusEnum.DRAFT]: { text: 'text-[#71717A]', bg: 'bg-[#F4F4F5]' },
    [RecruitmentRequestStatusEnum.PENDING]: { text: 'text-[#C4841D]', bg: 'bg-[#FEF3CD]' },
    [RecruitmentRequestStatusEnum.APPROVED]: { text: 'text-[#0E793C]', bg: 'bg-[#E8FAF0]' },
    [RecruitmentRequestStatusEnum.RECRUITING]: { text: 'text-primary', bg: 'bg-[#EEF5FF]' },
    [RecruitmentRequestStatusEnum.PAUSED]: { text: 'text-[#C4841D]', bg: 'bg-[#FEF3CD]' },
    [RecruitmentRequestStatusEnum.REJECTED]: { text: 'text-[#F31260]', bg: 'bg-[#FEE7EF]' },
    [RecruitmentRequestStatusEnum.CANCELLED]: { text: 'text-[#F31260]', bg: 'bg-[#FEE7EF]' },
    [RecruitmentRequestStatusEnum.CLOSED]: { text: 'text-[#71717A]', bg: 'bg-[#F4F4F5]' },
};

export const RecruitmentRequestDetails = ({
    id,
    tab = RecruitmentRequestTabEnum.CANDIDATES,
    onClose,
    currentIndex = 1,
    total = 1,
    onPrev,
    onNext,
}: RecruitmentRequestDetailsProps) => {
    const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
    const navigate = useNavigate();

    const handleTabChange = (key: React.Key) => {
        navigate({ to: '.', search: { tab: key as TabKey }, replace: true });
    };
    const { data: detailRes, isLoading: isDetailLoading } = useQuery(
        recruitmentRequestQueryOptions.detail(id),
    );
    const { data: candidatesRes, isLoading: isCandidatesLoading } = useCandidateList(id);

    const detail = detailRes?.data;
    const candidates = candidatesRes?.data ?? [];

    const daysRemaining = useMemo(() => {
        if (!detail?.requiredDate) return null;
        return dayjs(detail.requiredDate).diff(dayjs(), 'day');
    }, [detail?.requiredDate]);

    const progressPercent = useMemo(() => {
        if (!detail?.quantity || !detail?.candidateCount) return 0;
        return Math.min(Math.round((detail.candidateCount / detail.quantity) * 100), 100);
    }, [detail]);

    const statusColor = detail ? STATUS_COLOR[detail.status] : null;

    if (isDetailLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Spinner />
            </div>
        );
    }

    if (!detail) return null;
    const onBack = () => {
        navigate({ to: "/admin/recruitment-management/recruitment-request" })
    }
    return (
        <div className="flex flex-col h-full bg-[#FAFAFA]">
            {/* Header */}
            <div className="px-6 py-4 flex items-center gap-4">
                <Button className="rounded-full bg-white" isIconOnly onPress={onBack}>
                    <IconArrowLeft color="#52525B" />
                </Button>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <div >
                            <div className="text-lg font-bold text-[#11181C] truncate">{detail.position || detail?.jobTitle?.name}</div>
                            <div className="text-xs text-[#71717A]">{detail.code}</div>
                        </div>
                        {statusColor && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor.bg} ${statusColor.text}`}>
                                {t(`recruitment_request.status.${detail.status.toLowerCase()}` as any)}
                            </span>
                        )}

                    </div>
                </div>

                {/* Required date + progress */}
                {detail.requiredDate && (
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
                            <IconCalendar size={14} />
                            <span>{t('recruitment_request.card.required_date')}</span>
                            <span className="font-medium text-[#11181C]">
                                {dayjs(detail.requiredDate).format('D/M/YYYY')}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-[#E4E4E7] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            {daysRemaining !== null && (
                                <span className="text-xs text-[#71717A]">
                                    {t('recruitment_request.card.days_remaining', { count: daysRemaining })}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {total > 1 && (
                    <div className="flex items-center gap-1 shrink-0">
                        <Button isIconOnly size="sm" variant="light" className="rounded-lg h-7 w-7 min-w-7" onPress={onPrev} isDisabled={currentIndex <= 1}>
                            <IconChevronLeft size={16} />
                        </Button>
                        <span className="text-sm text-[#71717A] whitespace-nowrap">
                            {currentIndex} / {total} {t('recruitment_request.title').toLowerCase()}
                        </span>
                        <Button isIconOnly size="sm" variant="light" className="rounded-lg h-7 w-7 min-w-7" onPress={onNext} isDisabled={currentIndex >= total}>
                            <IconChevronRight size={16} />
                        </Button>
                    </div>
                )}

                {onClose && (
                    <Button size="sm" color="primary" className="rounded-xl font-medium shrink-0" onPress={onClose}>
                        {t('recruitment_request.actions.close')}
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex-1 overflow-hidden flex flex-col p-3">
                <Tabs
                    aria-label="recruitment-detail-tabs"
                    variant="underlined"
                    color="primary"
                    selectedKey={tab}
                    onSelectionChange={handleTabChange}
                    classNames={{
                        base: 'bg-transparent border-b border-[#11111126]',
                        panel: cn(tab === RecruitmentRequestTabEnum.INTERVIEWS && "overflow-y-auto")
                        // tabList: 'bg-transparent gap-4 p-0',
                        // tab: 'h-9 px-0 text-sm',
                        // cursor: 'bg-transparent shadow-none',
                        // panel: 'flex-1 overflow-hidden p-6',
                    }}
                >
                    <Tab key={RecruitmentRequestTabEnum.CANDIDATES} title={t('recruitment_request.details.candidate')}>
                        <LoadingWrapper isLoading={isCandidatesLoading} height='50vh'>
                            <CandidateKanban candidates={candidates} recruitmentRequestId={id} maxListboxHeight={720} />
                        </LoadingWrapper>
                    </Tab>
                    <Tab key={RecruitmentRequestTabEnum.INFO} title={t('recruitment_request.details.request_info')}>
                        {/* TODO: Thông tin yêu cầu */}
                        <div className='overflow-y-auto h-[calc(100vh-170px)]'>
                            <RecruitmentInformationSection />
                        </div>
                    </Tab>
                    <Tab key={RecruitmentRequestTabEnum.INTERVIEWS} title={t('recruitment_request.details.interview_schedule')}>
                        {/* TODO: Lịch phỏng vấn */}
                        <InterviewCalendar recruitmentRequestId={id} />
                    </Tab>
                </Tabs>
            </div>
        </div>
    );
};
