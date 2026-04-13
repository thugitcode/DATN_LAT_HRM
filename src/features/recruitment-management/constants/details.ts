import { CandidateStatusEnum } from "../recruitment-request-details/types/candidate.type";
import type { CriterionConfig } from "../types/candidate.type";

export enum DetailCandidateTabEnum {
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
    [CandidateStatusEnum.APPLIED]: { label: 'candidate.status.applied', color: 'text-black', bg: 'bg-default' },
    [CandidateStatusEnum.SCREENED]: { label: 'candidate.status.screened', color: 'text-[#7828C8]', bg: 'bg-[#F4EEFF]' },
    [CandidateStatusEnum.WAITING_INTERVIEW]: { label: 'candidate.status.waiting_interview', color: 'text-[#C4841D]', bg: 'bg-[#FEF3CD]' },
    [CandidateStatusEnum.INTERVIEWING]: { label: 'candidate.status.interviewing', color: 'text-primary', bg: 'bg-[#006FEE33]' },
    [CandidateStatusEnum.WAITING_OFFER]: { label: 'candidate.status.waiting_offer', color: 'text-cyan-600', bg: 'bg-cyan-100' },
    [CandidateStatusEnum.PROBATION_PROPOSED]: { label: 'candidate.status.probation_proposed', color: 'text-[#FF4ECD]', bg: 'bg-[#FFEDFA]' },
    [CandidateStatusEnum.ON_PROBATION]: { label: 'candidate.status.on_probation', color: 'text-success', bg: 'bg-[#17C96433]' },
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


export const CRITERIA_EVALUATION: CriterionConfig[] = [
    {
        key: 'professional',
        labelKey: 'candidate.detail.evaluation.professional_knowledge',
        scoreField: 'professionalScore',
        evaluationField: 'professionalEvaluation',
        commentField: 'professionalComment',
    },
    {
        key: 'attitude',
        labelKey: 'candidate.detail.evaluation.attitude',
        scoreField: 'attitudeScore',
        evaluationField: 'attitudeEvaluation',
        commentField: 'attitudeComment',
    },
    {
        key: 'communication',
        labelKey: 'candidate.detail.evaluation.communication',
        scoreField: 'communicationScore',
        evaluationField: 'communicationEvaluation',
        commentField: 'communicationComment',
    },
    {
        key: 'experience',
        labelKey: 'candidate.detail.evaluation.experience',
        scoreField: 'experienceScore',
        evaluationField: 'experienceEvaluation',
        commentField: 'experienceComment',
    },
];
