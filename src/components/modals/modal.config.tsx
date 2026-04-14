import { ModalType } from '@/store/useModal';
import type { ModalProps } from '@heroui/react';

import { ResendMailModal } from '@/features/recruitment-management/interview-schedule/components/resend-mail-modal';

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
};
