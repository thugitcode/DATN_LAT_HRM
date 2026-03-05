import type { FC } from 'react';
import { useConfirmStore } from '@/store/useConfirmStore';
import { Button, Chip } from '@heroui/react';
import { IconX } from '@tabler/icons-react';

import { Status } from '@/types/global.type';
import { icons } from '@/lib/icons';
import { useRejectAccountability } from '@/features/timekeeping-shift-scheduling/accountability-management/hooks/use-approve-accountability';

import { useApproveLeaveRequest, useRejectLeaveRequest } from '../hooks/use-leave-request';
import type { LeaveRequest } from '../type';

const StatusChip: FC<{ status: 'APPROVED' | 'REJECTED' }> = ({ status }) => {
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
      {isApproved ? 'Đã xác nhận' : 'Từ chối'}
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
}) => (
  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
    <Button
      size="md"
      variant="flat"
      isIconOnly
      isLoading={isRejecting}
      isDisabled={isApproving || isRejecting}
      className="rounded-lg h-8 w-8 min-w-8"
      title="Từ chối"
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
      Xác nhận
    </Button>
  </div>
);

export const RowLeaveRequestActions: FC<{ dataRow?: LeaveRequest }> = ({ dataRow }) => {
  const status = dataRow?.status;

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
        title: 'Phê duyệt đăng ký nghỉ',
        description: `Bạn có chắc chắn muốn phê duyệt đăng ký nghỉ của ${dataRow?.staffName}?`,
        confirmLabel: 'Phê duyệt',
        confirmColor: 'primary',
        requireReason: false,
      },
      (reason) => handleConfirmAction(reason, 'approve'),
    );
  };

  const handleRejectClick = () => {
    open(
      {
        title: 'Từ chối đăng ký nghỉ',
        description: `Vui lòng nhập lý do từ chối để nhân viên ${dataRow?.staffName} nắm được thông tin.`,
        confirmLabel: 'Từ chối',
        confirmColor: 'danger',
        requireReason: true,
      },
      (reason) => handleConfirmAction(reason, 'reject'),
    );
  };

  if (status === Status.APPROVED || status === Status.REJECTED) {
    return <StatusChip status={status} />;
  }

  return (
    <>
      <ActionButtons
        onApprove={handleApproveClick}
        onReject={handleRejectClick}
        isApproving={isApproving}
        isRejecting={isRejecting}
      />
    </>
  );
};
