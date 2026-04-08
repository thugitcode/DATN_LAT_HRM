import { CandidateStatusEnum } from "../recruitment-request-details/types/type";

export enum DetailTabEnum {
    APPLICATION = 'application',
    ATTACHMENTS = 'attachments',
    INTERVIEW_HISTORY = 'interview_history',
    EVALUATION = 'evaluation',
    OFFER = 'offer',
}

export const PIPELINE_STEPS: { key: CandidateStatusEnum; labelKey: string }[] = [
    { key: CandidateStatusEnum.APPLIED, labelKey: 'candidate.status.applied' },
    { key: CandidateStatusEnum.SCREENED, labelKey: 'candidate.status.screened' },
    { key: CandidateStatusEnum.WAITING_INTERVIEW, labelKey: 'candidate.status.waiting_interview' },
    { key: CandidateStatusEnum.INTERVIEWING, labelKey: 'candidate.status.interviewing' },
    { key: CandidateStatusEnum.WAITING_OFFER, labelKey: 'candidate.status.waiting_offer' },
    { key: CandidateStatusEnum.PROBATION_PROPOSED, labelKey: 'candidate.status.probation_proposed' },
    { key: CandidateStatusEnum.ON_PROBATION, labelKey: 'candidate.status.on_probation' },
];

export const STATUS_BADGE: Record<CandidateStatusEnum, { label: string; color: string; bg: string }> = {
    [CandidateStatusEnum.APPLIED]: { label: 'candidate.status.applied', color: 'text-primary', bg: 'bg-[#EEF5FF]' },
    [CandidateStatusEnum.SCREENED]: { label: 'candidate.status.screened', color: 'text-[#7828C8]', bg: 'bg-[#F4EEFF]' },
    [CandidateStatusEnum.WAITING_INTERVIEW]: { label: 'candidate.status.waiting_interview', color: 'text-[#C4841D]', bg: 'bg-[#FEF3CD]' },
    [CandidateStatusEnum.INTERVIEWING]: { label: 'candidate.status.interviewing', color: 'text-[#0E793C]', bg: 'bg-[#E8FAF0]' },
    [CandidateStatusEnum.WAITING_OFFER]: { label: 'candidate.status.waiting_offer', color: 'text-[#0E793C]', bg: 'bg-[#E8FAF0]' },
    [CandidateStatusEnum.PROBATION_PROPOSED]: { label: 'candidate.status.probation_proposed', color: 'text-primary', bg: 'bg-[#EEF5FF]' },
    [CandidateStatusEnum.ON_PROBATION]: { label: 'candidate.status.on_probation', color: 'text-[#71717A]', bg: 'bg-[#F4F4F5]' },
    [CandidateStatusEnum.REJECTED]: { label: 'candidate.status.rejected', color: 'text-[#F31260]', bg: 'bg-[#FEE7EF]' },
    [CandidateStatusEnum.OFFER_DECLINED]: { label: 'candidate.status.offer_declined', color: 'text-[#F31260]', bg: 'bg-[#FEE7EF]' },
};

export const GENDER_LABEL: Record<string, string> = {
    MALE: 'Nam',
    FEMALE: 'Nữ',
    OTHER: 'Khác',
};

export const formatSalary = (value: string | null) => {
    if (!value) return '—';
    const num = parseFloat(value);
    return isNaN(num) ? '—' : `${num.toLocaleString('vi-VN')} VND`;
};
