
import { InterviewStatusEnum } from "../types/interview.type";
type StatusConfig = {
    chipColor: 'default' | 'success' | 'warning' | 'danger' | 'secondary';
    bgColor: string;
    borderLColor: string;
    borderTColor: string;
};

export const STATUS_CONFIG: Record<InterviewStatusEnum, StatusConfig> = {
    [InterviewStatusEnum.PENDING_CONFIRMATION]: {
        chipColor: 'default',
        bgColor: 'bg-[#F4F4F5]',
        borderLColor: 'border-l-[#000000]',
        borderTColor: 'border-t-[#000000]',
    },
    [InterviewStatusEnum.CONFIRMED]: {
        chipColor: 'success',
        bgColor: 'bg-[#E8FAF0]',
        borderLColor: 'border-l-[#17C964]',
        borderTColor: 'border-t-[#17C964]',
    },
    [InterviewStatusEnum.PENDING_EVALUATION]: {
        chipColor: 'warning',
        bgColor: 'bg-[#FEFCE8]',
        borderLColor: 'border-l-[#F5A524]',
        borderTColor: 'border-t-[#F5A524]',
    },
    [InterviewStatusEnum.POSTPONED]: {
        chipColor: 'secondary',
        bgColor: 'bg-[#F2EAFA]',
        borderLColor: 'border-l-[#7828C8]',
        borderTColor: 'border-t-[#7828C8]',
    },
    [InterviewStatusEnum.CANCELLED]: {
        chipColor: 'danger',
        bgColor: 'bg-[#FEE7EF]',
        borderLColor: 'border-l-[#F31260]',
        borderTColor: 'border-t-[#F31260]',
    },
};

export enum RecruitmentRequestTabEnum {
    CANDIDATES = 'candidates',
    INFO = 'info',
    INTERVIEWS = 'interviews',
}
