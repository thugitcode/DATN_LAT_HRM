
import { InterviewStatusEnum } from "../types/interview.type";
type StatusConfig = {
    chipColor: 'default' | 'success' | 'warning' | 'danger' | 'secondary';
    bgColor: string;
    borderColor: string;
};

export const STATUS_CONFIG: Record<InterviewStatusEnum, StatusConfig> = {
    [InterviewStatusEnum.PENDING_CONFIRMATION]: {
        chipColor: 'default',
        bgColor: 'bg-[#F4F4F5]',
        borderColor: 'border-l-[#000000]',
    },
    [InterviewStatusEnum.CONFIRMED]: {
        chipColor: 'success',
        bgColor: 'bg-[#E8FAF0]',
        borderColor: 'border-l-[#17C964]',
    },
    [InterviewStatusEnum.PENDING_EVALUATION]: {
        chipColor: 'warning',
        bgColor: 'bg-[#FEFCE8]',
        borderColor: 'border-l-[#F5A524]',
    },
    [InterviewStatusEnum.POSTPONED]: {
        chipColor: 'secondary',
        bgColor: 'bg-[#F2EAFA]',
        borderColor: 'border-l-[#7828C8]',
    },
    [InterviewStatusEnum.CANCELLED]: {
        chipColor: 'danger',
        bgColor: 'bg-[#FEE7EF]',
        borderColor: 'border-l-[#F31260]',
    },
};

export enum RecruitmentRequestTabEnum {
    CANDIDATES = 'candidates',
    INFO = 'info',
    INTERVIEWS = 'interviews',
}
