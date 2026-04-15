import { ModalType } from '@/store/useModal';
import type { ModalProps } from '@heroui/react';

import { ResendMailModal } from '@/features/recruitment-management/interview-schedule/components/resend-mail-modal';
import { ProbationEvaluationListModal } from '@/features/recruitment-management/probation-management/components/probation-evaluation-list-modal';

type ModalConfig = {
  title?: string;
  component: React.ReactNode;
  modalProps?: Partial<ModalProps>;
};

export const MODAL_CONFIG: Record<ModalType, ModalConfig> = {
  [ModalType.RESEND_MAIL]: {
    component: <ResendMailModal />,
    modalProps: { size: 'xl', style: { width: '50vw', maxWidth: '50vw' } },
  },
  [ModalType.PROBATION_EVALUATION_LIST]: {
    title: 'Đánh giá thử việc',
    component: <ProbationEvaluationListModal />,
    modalProps: { size: '5xl', style: { width: '80vw', maxWidth: '80vw' } },
  },
};
