import { useCallback, useState, type FC } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import {
  addToast,
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from '@heroui/react';
import { IconAlertTriangle, IconCheck, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { icons } from '@/lib/icons';
import { useUpdateAttendanceExplanation } from '@/hooks/use-attendance-explanation';

import {
  useApproveAccountability,
  useRejectAccountability,
} from '../hooks/use-approve-accountability';
import { AttendanceExplanationStatus, type AttendanceExplanation } from '../types';

type ConfirmAction = 'approve' | 'reject';

interface ConfirmConfig {
  action: ConfirmAction;
  title: string;
  description: string;
  confirmLabel: string;
  confirmColor: 'primary' | 'danger';
  requireReason?: boolean;
}

interface RowActionsProps {
  dataRow?: AttendanceExplanation;
}

const useConfirmConfig = (): Record<ConfirmAction, ConfirmConfig> => {
  const { t } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);
  return {
    approve: {
      action: 'approve',
      title: t('explanation_management.row_actions.approve_title'),
      description: t('explanation_management.row_actions.approve_desc'),
      confirmLabel: t('explanation_management.row_actions.approve_label'),
      confirmColor: 'primary',
    },
    reject: {
      action: 'reject',
      title: t('explanation_management.row_actions.reject_title'),
      description: t('explanation_management.row_actions.reject_desc'),
      confirmLabel: t('explanation_management.row_actions.reject_label'),
      confirmColor: 'danger',
      requireReason: true,
    },
  };
};

const MAX_REASON_LENGTH = 500;

const StatusChip: FC<{ status: 'APPROVED' | 'REJECTED' }> = ({ status }) => {
  const { t } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);

  const isApproved = status === 'APPROVED';

  return (
    <Chip
      size="md"
      variant="flat"
      color={isApproved ? 'success' : 'danger'}
      classNames={{
        base: 'h-8 w-[116px] px-2',
        content: 'text-sm font-medium flex-1 text-center',
      }}
      startContent={
        isApproved ? (
          <icons.tickCircle width={17} height={17} />
        ) : (
          <icons.closeSquare className="rounded-full" width={17} height={17} />
        )
      }
    >
      {isApproved
        ? t('explanation_management.summary.approved')
        : t('explanation_management.summary.rejected')}
    </Chip>
  );
};

interface ActionButtonsProps {
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}

const ActionButtons: FC<ActionButtonsProps> = ({
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}) => {
  const { t } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <Button
        size="md"
        variant="flat"
        isIconOnly
        isLoading={isRejecting}
        isDisabled={isApproving || isRejecting}
        className="rounded-lg h-8 w-8 min-w-8"
        title={t('explanation_management.row_actions.reject_label')}
        onPress={onReject}
      >
        {!isRejecting && <IconX size={16} color="red" />}
      </Button>
      <Button
        size="md"
        color="primary"
        isLoading={isApproving}
        isDisabled={isApproving || isRejecting}
        className="rounded-lg font-medium h-8 px-3 text-sm"
        onPress={onApprove}
      >
        {t('explanation_management.confirm')}
      </Button>
    </div>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  config: ConfirmConfig | null;
  isLoading: boolean;
  reason: string;
  onReasonChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmModal: FC<ConfirmModalProps> = ({
  isOpen,
  config,
  isLoading,
  reason,
  onReasonChange,
  onConfirm,
  onClose,
}) => {
  const { t } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);

  if (!config) return null;

  const isOverLimit = reason.length > MAX_REASON_LENGTH;
  const isReasonEmpty = config.requireReason && reason.trim().length === 0;
  const isConfirmDisabled = isReasonEmpty || isOverLimit;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isDismissable={!isLoading}
      hideCloseButton={isLoading}
      size="sm"
      onClick={(e) => e.stopPropagation()}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <IconAlertTriangle
            size={20}
            className={config.action === 'reject' ? 'text-danger' : 'text-primary'}
          />
          <span>{config.title}</span>
        </ModalHeader>

        <ModalBody className="gap-3">
          <p className="text-sm text-default-600">{config.description}</p>

          {config.requireReason && (
            <Textarea
              autoFocus
              label={t('explanation_management.row_actions.reject_reason_label')}
              placeholder={t('explanation_management.row_actions.reject_reason_placeholder')}
              value={reason}
              onValueChange={onReasonChange}
              isDisabled={isLoading}
              isInvalid={isOverLimit}
              errorMessage={
                isOverLimit
                  ? t('explanation_management.row_actions.max_chars', { max: MAX_REASON_LENGTH })
                  : undefined
              }
              description={!isOverLimit ? `${reason.length}/${MAX_REASON_LENGTH}` : undefined}
              minRows={3}
              maxRows={5}
              classNames={{ label: 'text-sm font-medium' }}
            />
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" isDisabled={isLoading} onPress={onClose}>
            Hủy
          </Button>
          <Button
            color={config.confirmColor}
            isLoading={isLoading}
            isDisabled={isConfirmDisabled}
            startContent={
              !isLoading &&
              (config.action === 'approve' ? <IconCheck size={16} /> : <IconX size={16} />)
            }
            onPress={onConfirm}
          >
            {config.confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export const RowActions: FC<Readonly<RowActionsProps>> = ({ dataRow }) => {
  const { t } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);
  const confirmConfig = useConfirmConfig();

  const [pendingAction, setPendingAction] = useState<ConfirmAction | null>(null);
  const [reason, setReason] = useState('');

  const { mutate: approve, isPending: isApproving } = useApproveAccountability();
  const { mutate: reject, isPending: isRejecting } = useRejectAccountability();
  const { mutateAsync: update, isPending: isUpdate } = useUpdateAttendanceExplanation();

  const handleOpenConfirm = useCallback((action: ConfirmAction) => {
    setReason('');
    setPendingAction(action);
  }, []);

  const handleClose = useCallback(() => {
    if (isApproving || isRejecting) return;
    setPendingAction(null);
    setReason('');
  }, [isApproving, isRejecting]);

  const handleConfirm = useCallback(() => {
    if (!dataRow?.id || !pendingAction) return;

    const onSettled = () => {
      setPendingAction(null);
      setReason('');
    };
    if (pendingAction === 'approve') {
      update(
        {
          id: dataRow?.id,
          status: AttendanceExplanationStatus.APPROVED,
        },
        {
          onSuccess: () =>
            addToast({
              description: t('explanation_management.row_actions.approve_success'),
              color: 'success',
            }),

          onSettled: onSettled,
        },
      );
      // approve({ id: dataRow.id }, { onSuccess: onSettled, onError: onSettled });
    } else {
      update(
        {
          id: dataRow?.id,
          status: AttendanceExplanationStatus.REJECTED,
          reason: reason,
        },
        {
          onSuccess: () =>
            addToast({
              description: t('explanation_management.row_actions.reject_success'),
              color: 'success',
            }),

          onSettled: onSettled,
        },
      );
    }
    // if (pendingAction === 'approve') {
    //   approve({ id: dataRow.id }, { onSuccess: onSettled, onError: onSettled });
    // } else {
    //   reject(
    //     {
    //       id: dataRow.id,
    //       payload: {
    //         reason,
    //       },
    //     },
    //     { onSuccess: onSettled, onError: onSettled },
    //   );
    // }
  }, [dataRow?.id, pendingAction, update, t, reason]);

  const renderContent = () => {
    const { status } = dataRow ?? {};

    if (status === 'PENDING' || status === 'PENDING_HR') {
      return (
        <ActionButtons
          onApprove={() => handleOpenConfirm('approve')}
          onReject={() => handleOpenConfirm('reject')}
          isApproving={isApproving}
          isRejecting={isRejecting}
        />
      );
    }

    if (status === 'APPROVED' || status === 'REJECTED') {
      return <StatusChip status={status} />;
    }

    return null;
  };

  return (
    <>
      <div>{renderContent()}</div>

      <ConfirmModal
        isOpen={!!pendingAction}
        config={pendingAction ? confirmConfig[pendingAction] : null}
        isLoading={isApproving || isRejecting}
        reason={reason}
        onReasonChange={setReason}
        onConfirm={handleConfirm}
        onClose={handleClose}
      />
    </>
  );
};
