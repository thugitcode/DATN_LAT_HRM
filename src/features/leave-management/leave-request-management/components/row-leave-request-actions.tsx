import { NAMESPACES } from '@/i18n/constants';
import { useConfirmStore } from '@/store/useConfirmStore';
import { Button } from '@heroui/react';
import { IconX } from '@tabler/icons-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';


import { StatusChip } from '@/features/timekeeping-shift-scheduling/accountability-management/components/row-actions';
import { RequestStatusEnum } from '@/types/attendance-explanation.type';
import { useApproveLeaveRequest, useRejectLeaveRequest } from '../hooks/use-leave-request';
import type { LeaveRequest } from '../type';


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
  const { t } = useTranslation(NAMESPACES.LEAVE_MANAGEMENT);

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <Button
        size="md"
        variant="flat"
        isIconOnly
        isLoading={isRejecting}
        isDisabled={isApproving || isRejecting}
        className="rounded-lg h-8 w-8 min-w-8"
        title={t('leave_request.actions.reject')}
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
        {t('leave_request.actions.confirm')}
      </Button>
    </div>
  );
};

export const RowLeaveRequestActions: FC<{ dataRow?: LeaveRequest }> = ({ dataRow }) => {
  const status = dataRow?.status;
  const { t } = useTranslation(NAMESPACES.LEAVE_MANAGEMENT);

  const open = useConfirmStore((state) => state.open);
  const { mutate: approve, isPending: isApproving } = useApproveLeaveRequest();
  const { mutate: reject, isPending: isRejecting } = useRejectLeaveRequest();

  const handleConfirmAction = async (reason?: string, actionType?: 'approve' | 'reject') => {
    if (!dataRow?.id) return;

    return new Promise<void>((resolve) => {
      const onSettled = () => resolve();

      if (actionType === 'reject') {
        reject(
          {
            id: dataRow.id,
            payload: {
              // Sau này khi đăng nhập đc thì thay bằng id user login
              approvedById: 'admin-manager-uuid',
              rejectedReason: reason ?? '',
            },
          },
          { onSuccess: onSettled, onError: onSettled },
        );
      } else {
        approve(
          {
            id: dataRow.id,
            payload: {
              // Sau này khi đăng nhập đc thì thay bằng id user login
              approvedById: 'admin-manager-uuid',
            },
          },
          { onSuccess: onSettled, onError: onSettled },
        );
      }
    });
  };

  const handleApproveClick = () => {
    open(
      {
        title: t('leave_request.actions.approve_title'),
        description: t('leave_request.actions.approve_desc', { name: dataRow?.staffName }),
        confirmLabel: t('leave_request.actions.approve'),
        confirmColor: 'primary',
        requireReason: false,
      },
      (reason) => handleConfirmAction(reason, 'approve'),
    );
  };

  const handleRejectClick = () => {
    open(
      {
        title: t('leave_request.actions.reject_title'),
        description: t('leave_request.actions.reject_desc', { name: dataRow?.staffName }),
        confirmLabel: t('leave_request.actions.reject'),
        confirmColor: 'danger',
        requireReason: true,
      },
      (reason) => handleConfirmAction(reason, 'reject'),
    );
  };

  if (status === RequestStatusEnum.APPROVED || status === RequestStatusEnum.HR_REJECTED || status === RequestStatusEnum.PENDING || status === RequestStatusEnum.MANAGER_REJECTED) {
    return <StatusChip status={status} />;
  }

  return (
    <>
      {status === RequestStatusEnum.MANAGER_APPROVED ? <ActionButtons
        onApprove={handleApproveClick}
        onReject={handleRejectClick}
        isApproving={isApproving}
        isRejecting={isRejecting}
      /> : <></>}
    </>
  );
};
