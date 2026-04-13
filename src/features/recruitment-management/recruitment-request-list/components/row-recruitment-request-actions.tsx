import type { FC } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
import {
  IconCopy,
  IconDots,
  IconEdit,
  IconEye,
  IconPrinter,
  IconTrash,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { RecruitmentRequestActionEnum, RecruitmentRequestStatusEnum, type RecruitmentRequest } from '../types/type';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import { ControlMode, useControlMode } from '@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle';
import { useRecruitmentRequestAction } from '../hooks/use-recruitment-request-action';
import { useConfirmStore } from '@/store/useConfirmStore';
import { useIsFetching } from '@tanstack/react-query';
import { recruitmentRequestKeys } from '@/services/query-options/recruitment-request.query';
import { cn } from '@/lib/utils';

const BTN_BASE = 'rounded-xl font-medium h-9 min-w-[120px] text-sm border-1';

interface RowRecruitmentRequestActionsProps {
  dataRow?: RecruitmentRequest;
}

export const useRecruitmentRequestActions = (dataRow?: RecruitmentRequest) => {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const { onOpen } = useDrawer();
  const { setMode } = useControlMode();
  const openConfirm = useConfirmStore((s) => s.open);
  const isFetchingList = useIsFetching({ queryKey: recruitmentRequestKeys.lists() }) > 0;

  const { mutate: submit, isPending: isSubmitting } = useRecruitmentRequestAction(RecruitmentRequestActionEnum.SUBMIT, dataRow?.id ?? '');
  const { mutate: approve, isPending: isApproving } = useRecruitmentRequestAction(RecruitmentRequestActionEnum.APPROVE, dataRow?.id ?? '');
  const { mutate: openRecruiting, isPending: isOpeningRecruiting } = useRecruitmentRequestAction(RecruitmentRequestActionEnum.OPEN_RECRUITING, dataRow?.id ?? '');
  const { mutate: pause, isPending: isPausing } = useRecruitmentRequestAction(RecruitmentRequestActionEnum.PAUSE, dataRow?.id ?? '');
  const { mutate: resume, isPending: isResuming } = useRecruitmentRequestAction(RecruitmentRequestActionEnum.RESUME, dataRow?.id ?? '');
  const { mutate: reject, isPending: isRejecting } = useRecruitmentRequestAction(RecruitmentRequestActionEnum.REJECT, dataRow?.id ?? '');
  const { mutate: closeRequest } = useRecruitmentRequestAction(RecruitmentRequestActionEnum.CLOSE, dataRow?.id ?? '');
  const { mutate: cancelRequest, isPending: isCancelling } = useRecruitmentRequestAction(RecruitmentRequestActionEnum.CANCEL, dataRow?.id ?? '');

  const handleCloseRequest = () => {
    openConfirm(
      {
        title: t('recruitment_request.confirm.close_title'),
        description: t('recruitment_request.confirm.close_description'),
        confirmLabel: t('recruitment_request.actions.close'),
        confirmColor: 'danger',
        requireReason: true,
      },
      async () => closeRequest(undefined),
    );
  };

  const handleReject = () => {
    openConfirm(
      {
        title: t('recruitment_request.confirm.reject_title'),
        description: t('recruitment_request.confirm.reject_description'),
        confirmLabel: t('recruitment_request.actions.reject'),
        confirmColor: 'danger',
        requireReason: true,
      },
      async (reason) => reject({ rejectionReason: reason ?? '' }),
    );
  };

  const handleCancelRequest = () => {
    openConfirm(
      {
        title: t('recruitment_request.confirm.cancel_title'),
        description: t('recruitment_request.confirm.cancel_description'),
        confirmLabel: t('recruitment_request.actions.delete'),
        confirmColor: 'danger',
      },
      async () => cancelRequest(undefined),
    );
  };

  return {
    t,
    onOpen,
    setMode,
    openConfirm,
    isFetchingList,
    actions: {
      submit, isSubmitting,
      approve, isApproving,
      openRecruiting, isOpeningRecruiting,
      pause, isPausing,
      resume, isResuming,
      reject, isRejecting,
      closeRequest,
      cancelRequest,
      handleCloseRequest,
      handleReject,
      handleCancelRequest,
      isCancelling,
    }
  };
};

export const RecruitmentRequestActionButtons: FC<{ dataRow: RecruitmentRequest; className?: string; size?: 'sm' | 'md' | 'lg' }> = ({ dataRow, className, size = 'md' }) => {
  const { t, isFetchingList, actions } = useRecruitmentRequestActions(dataRow);
  const { submit, isSubmitting, approve, isApproving, openRecruiting, isOpeningRecruiting, pause, isPausing, resume, isResuming, isRejecting, handleReject } = actions;

  const btnClass = cn(BTN_BASE, className);

  const renderButtons = () => {
    switch (dataRow.status) {
      case RecruitmentRequestStatusEnum.PENDING:
        return (
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              variant="flat"
              className="rounded-lg h-8 w-8 min-w-8"
              isLoading={isRejecting || isFetchingList}
              onPress={handleReject}
            >
              <IconX size={16} color="#F31260" />
            </Button>
            <Button color="primary" className={btnClass} size={size} isLoading={isApproving || isFetchingList} onPress={() => approve(undefined)}>
              {t('recruitment_request.actions.approve')}
            </Button>
          </div>
        );
      case RecruitmentRequestStatusEnum.DRAFT:
        return (
          <Button color="primary" className={btnClass} size={size} isLoading={isSubmitting || isFetchingList} onPress={() => submit(undefined)}>
            {t('recruitment_request.actions.submit_review')}
          </Button>
        );
      case RecruitmentRequestStatusEnum.REJECTED:
        return (
          <Button color="primary" className={btnClass} size={size} isLoading={isSubmitting || isFetchingList} onPress={() => submit(undefined)}>
            {t('recruitment_request.actions.resubmit_review')}
          </Button>
        );
      case RecruitmentRequestStatusEnum.APPROVED:
        return (
          <Button color="primary" className={btnClass} size={size} isLoading={isOpeningRecruiting || isFetchingList} onPress={() => openRecruiting(undefined)}>
            {t('recruitment_request.actions.start_recruiting')}
          </Button>
        );
      case RecruitmentRequestStatusEnum.RECRUITING:
        return (
          <Button variant="bordered" color="primary" className={btnClass} size={size} isLoading={isPausing || isFetchingList} onPress={() => pause(undefined)}>
            {t('recruitment_request.actions.pause')}
          </Button>
        );
      case RecruitmentRequestStatusEnum.PAUSED:
        return (
          <Button variant="bordered" color="primary" className={btnClass} size={size} isLoading={isResuming || isFetchingList} onPress={() => resume(undefined)}>
            {t('recruitment_request.actions.resume')}
          </Button>
        );
      case RecruitmentRequestStatusEnum.CLOSED:
      case RecruitmentRequestStatusEnum.CANCELLED:
        return (
          <Button variant="bordered" color="primary" className={btnClass} size={size}>
            {t('recruitment_request.actions.view_detail')}
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()} className={className}>
      {renderButtons()}
    </div>
  );
};



export const RecruitmentRequestActionDropdown: FC<{ dataRow: RecruitmentRequest }> = ({ dataRow }) => {
  const { t, onOpen, setMode, actions } = useRecruitmentRequestActions(dataRow);
  const { handleCloseRequest, handleCancelRequest } = actions;

  const getDropdownItems = () => {
    const items: { key: string; label: string; icon: React.ReactNode; color?: 'danger'; onClick?: () => void }[] = [];

    switch (dataRow.status) {
      case RecruitmentRequestStatusEnum.DRAFT:
        items.push(
          {
            key: 'edit',
            label: t('recruitment_request.actions.edit'),
            icon: <IconEdit size={16} />,
            onClick: () => {
              setMode(ControlMode.edit);
              onOpen(DrawerType.RECRUITMENT_REQUEST_MUTATE, { id: dataRow?.id });
            }
          },
          {
            key: 'delete',
            label: t('recruitment_request.actions.delete'),
            icon: <IconTrash size={16} />,
            color: 'danger',
            onClick: handleCancelRequest
          },
        );
        break;
      case RecruitmentRequestStatusEnum.PENDING:
        items.push(
          {
            key: 'revoke',
            label: t('recruitment_request.actions.revoke'), icon: <IconX size={16} />
          },
          {
            key: 'print',
            label: t('recruitment_request.actions.print'),
            icon: <IconPrinter size={16} />
          },
        );
        break;
      case RecruitmentRequestStatusEnum.REJECTED:
        items.push(
          {
            key: 'view_reason',
            label: t('recruitment_request.actions.view_reason'), icon: <IconEye size={16} />
          },
          {
            key: 'edit',
            label: t('recruitment_request.actions.edit'),
            icon: <IconEdit size={16} />
          },
        );
        break;
      case RecruitmentRequestStatusEnum.APPROVED:
        items.push(
          {
            key: 'edit_limited',
            label: t('recruitment_request.actions.edit_limited'),
            icon: <IconEdit size={16} />
          },
        );
        break;
      case RecruitmentRequestStatusEnum.RECRUITING:
        items.push(
          {
            key: 'close',
            label: t('recruitment_request.actions.close'),
            icon: <IconX size={16} />,
            onClick: handleCloseRequest
          },
          {
            key: 'view_candidates',
            label: t('recruitment_request.actions.view_candidates'),
            icon: <IconUsers size={16} />
          },
        );
        break;
      case RecruitmentRequestStatusEnum.PAUSED:
        items.push(
          {
            key: 'close',
            label: t('recruitment_request.actions.close'),
            icon: <IconX size={16} />,
            onClick: handleCloseRequest
          },
        );
        break;
      case RecruitmentRequestStatusEnum.CLOSED:
      case RecruitmentRequestStatusEnum.CANCELLED:
        items.push(
          {
            key: 'duplicate',
            label: t('recruitment_request.actions.duplicate'), icon: <IconCopy size={16} />
          },
        );
        break;
    }

    items.push({
      key: 'view_detail',
      label: t('recruitment_request.actions.view_detail'),
      icon: <IconEye size={16} />,
      onClick: () => { setMode(ControlMode.view); onOpen(DrawerType.RECRUITMENT_REQUEST_MUTATE, { id: dataRow?.id }); }
    });

    return items;
  };

  const dropdownItems = getDropdownItems();

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly variant="light" className="rounded-lg h-8 w-8 min-w-8" onClick={(e) => e.stopPropagation()}>
          <IconDots size={18} color="#71717A" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="actions">
        {dropdownItems.map((item) => (
          <DropdownItem
            key={item.key}
            startContent={item.icon}
            color={item.color}
            className={item.color === 'danger' ? 'text-danger' : ''}
            onClick={() => item.onClick?.()}
          >
            {item.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export const RowRecruitmentRequestActions: FC<RowRecruitmentRequestActionsProps> = ({
  dataRow,
}) => {
  if (!dataRow) return null;

  return (
    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
      <RecruitmentRequestActionButtons dataRow={dataRow} />
      <RecruitmentRequestActionDropdown dataRow={dataRow} />
    </div>
  );
};

