import type { FC } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useConfirmStore } from '@/store/useConfirmStore';
import { Button } from '@heroui/react';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import {
  useApproveRecruitmentRequest,
  useCloseRecruitmentRequest,
} from '../hooks/use-recruitment-request';
import { RecruitmentRequestStatusEnum, type RecruitmentRequest } from '../type';

interface RowRecruitmentRequestActionsProps {
  dataRow?: RecruitmentRequest;
}

export const RowRecruitmentRequestActions: FC<RowRecruitmentRequestActionsProps> = ({
  dataRow,
}) => {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const open = useConfirmStore((state) => state.open);

  const { mutate: approve, isPending: isApproving } = useApproveRecruitmentRequest();
  const { mutate: close, isPending: isClosing } = useCloseRecruitmentRequest();

  const handleApprove = () => {
    if (!dataRow?.id) return;
    open(
      {
        title: t('recruitment_request.actions.approve_title'),
        description: t('recruitment_request.actions.approve_desc'),
        confirmLabel: t('recruitment_request.actions.approve'),
        confirmColor: 'primary',
        requireReason: false,
      },
      () =>
        new Promise<void>((resolve) => {
          approve(
            { id: dataRow.id, payload: { approvedById: 'admin-manager-uuid' } },
            { onSettled: () => resolve() },
          );
        }),
    );
  };

  const handleClose = () => {
    if (!dataRow?.id) return;
    open(
      {
        title: t('recruitment_request.actions.close_title'),
        description: t('recruitment_request.actions.close_desc'),
        confirmLabel: t('recruitment_request.actions.close'),
        confirmColor: 'danger',
        requireReason: false,
      },
      () =>
        new Promise<void>((resolve) => {
          close(dataRow.id, { onSettled: () => resolve() });
        }),
    );
  };

  const getActionButton = () => {
    if (!dataRow) return null;

    switch (dataRow.status) {
      case RecruitmentRequestStatusEnum.PENDING:
        return (
          <Button
            size="sm"
            color="primary"
            className="rounded-lg font-medium h-8 px-4 text-sm"
            isLoading={isApproving}
            onPress={handleApprove}
          >
            {t('recruitment_request.actions.approve')}
          </Button>
        );
      case RecruitmentRequestStatusEnum.RECRUITING:
        return (
          <Button
            size="sm"
            variant="bordered"
            color="primary"
            className="rounded-lg font-medium h-8 px-4 text-sm"
            isLoading={isClosing}
            onPress={handleClose}
          >
            {t('recruitment_request.actions.close')}
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      {getActionButton()}
      <Button
        isIconOnly
        size="sm"
        variant="light"
        className="rounded-lg h-8 w-8 min-w-8"
        title={t('recruitment_request.actions.edit')}
      >
        <IconEdit size={18} color="#71717A" />
      </Button>
      <Button
        isIconOnly
        size="sm"
        variant="light"
        className="rounded-lg h-8 w-8 min-w-8"
        title={t('recruitment_request.actions.delete')}
      >
        <IconTrash size={18} color="#71717A" />
      </Button>
    </div>
  );
};
