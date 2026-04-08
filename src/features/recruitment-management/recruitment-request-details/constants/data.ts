
import { InterviewStatusEnum } from "../types/interview.type";
type StatusConfig = {
    chipColor: 'default' | 'success' | 'warning' | 'danger' | 'secondary';
    bgColor: string;
    borderLColor: string;
    borderTColor: string;
    color: string;
    bg: string;
};

export const INTERVIEW_STATUS_CONFIG: Record<InterviewStatusEnum, StatusConfig> = {
    [InterviewStatusEnum.PENDING_CONFIRMATION]: {
        chipColor: 'default',
        bgColor: 'bg-[#F4F4F5]',
        borderLColor: 'border-l-[#000000]',
        borderTColor: 'border-t-[#000000]',
        color: 'text-[#71717A]',
        bg: 'bg-[#F4F4F5]',
    },
    [InterviewStatusEnum.CONFIRMED]: {
        chipColor: 'success',
        bgColor: 'bg-[#E8FAF0]',
        borderLColor: 'border-l-[#17C964]',
        borderTColor: 'border-t-[#17C964]',
        color: 'text-[#0E793C]',
        bg: 'bg-[#E8FAF0]',
    },
    [InterviewStatusEnum.PENDING_EVALUATION]: {
        chipColor: 'warning',
        bgColor: 'bg-[#FEFCE8]',
        borderLColor: 'border-l-[#F5A524]',
        borderTColor: 'border-t-[#F5A524]',
        color: 'text-[#C4841D]',
        bg: 'bg-[#FEFCE8]',
    },
    [InterviewStatusEnum.POSTPONED]: {
        chipColor: 'secondary',
        bgColor: 'bg-[#F2EAFA]',
        borderLColor: 'border-l-[#7828C8]',
        borderTColor: 'border-t-[#7828C8]',
        color: 'text-[#7828C8]',
        bg: 'bg-[#F2EAFA]',
    },
    [InterviewStatusEnum.CANCELLED]: {
        chipColor: 'danger',
        bgColor: 'bg-[#FEE7EF]',
        borderLColor: 'border-l-[#F31260]',
        borderTColor: 'border-t-[#F31260]',
        color: 'text-[#F31260]',
        bg: 'bg-[#FEE7EF]',
    },
};

export enum RecruitmentRequestTabEnum {
    CANDIDATES = 'candidates',
    INFO = 'info',
    INTERVIEWS = 'interviews',
}
