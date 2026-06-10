import { IconMail } from "@tabler/icons-react";
import { InterviewStatusEnum } from "../recruitment-request-details/types/interview.type";
import type { ActionConfig } from "../types/interview-schedule";


export const STATUS_INTERVIEW_SCHEDULE_ACTIONS: Partial<Record<InterviewStatusEnum, ActionConfig>> = {
    [InterviewStatusEnum.PENDING_CONFIRMATION]: {
        secondary: [
            { key: 'cancel', color: 'danger', variant: 'bordered' },
            { key: 'reschedule', color: 'primary', variant: 'bordered' },
        ],
        primary: {
            key: 'resend_mail',
            color: 'primary',
            variant: 'solid',
            icon: <IconMail size={15} />,
        },
    },
    [InterviewStatusEnum.CONFIRMED]: {
        secondary: [
            { key: 'cancel', color: 'danger', variant: 'bordered' },
            { key: 'reschedule', color: 'primary', variant: 'bordered' },
        ],
        primary: { key: 'postpone', color: 'primary', variant: 'solid' },
    },
    // [InterviewStatusEnum.PENDING_EVALUATION]: {
    //     primary: { key: 'evaluate', color: 'primary', variant: 'solid' },
    // },
    [InterviewStatusEnum.POSTPONED]: {
        secondary: [
            { key: 'cancel', color: 'danger', variant: 'bordered' },
            { key: 'resend', color: 'primary', variant: 'bordered' },
        ],
        primary: { key: 'create_new', color: 'primary', variant: 'solid' },
    },
    [InterviewStatusEnum.CANCELLED]: {
        primary: { key: 'create_new', color: 'primary', variant: 'solid' },
    },
};