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

const BTN_BASE = 'rounded-xl font-medium h-9 w-[120px] text-sm';

interface RowRecruitmentRequestActionsProps {
  dataRow?: RecruitmentRequest;
}

export const RowRecruitmentRequestActions: FC<RowRecruitmentRequestActionsProps> = ({
  dataRow,
}) => {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const { onOpen } = useDrawer()
  const { setMode } = useControlMode()
  const { mutate: submit, isPending: isSubmitting } = useRecruitmentRequestAction(RecruitmentRequestActionEnum.SUBMIT, dataRow?.id ?? '');
  const { mutate: approve, isPending: isApproving } = useRecruitmentRequestAction(RecruitmentRequestActionEnum.APPROVE, dataRow?.id ?? '');
  const { mutate: openRecruiting, isPending: isOpeningRecruiting } = useRecruitmentRequestAction(RecruitmentRequestActionEnum.OPEN_RECRUITING, dataRow?.id ?? '');
  const { mutate: pause, isPending: isPausing } = useRecruitmentRequestAction(RecruitmentRequestActionEnum.PAUSE, dataRow?.id ?? '');
  const { mutate: resume, isPending: isResuming } = useRecruitmentRequestAction(RecruitmentRequestActionEnum.RESUME, dataRow?.id ?? '');
  const { mutate: reject, isPending: isRejecting } = useRecruitmentRequestAction(RecruitmentRequestActionEnum.REJECT, dataRow?.id ?? '');
  const { mutate: closeRequest } = useRecruitmentRequestAction(RecruitmentRequestActionEnum.CLOSE, dataRow?.id ?? '');
  const openConfirm = useConfirmStore((s) => s.open);
  const isFetchingList = useIsFetching({ queryKey: recruitmentRequestKeys.lists() }) > 0;

  if (!dataRow) return null;

  const renderActions = () => {
    switch (dataRow.status) {
      // Chờ duyệt: nút X đỏ (reject) + "Duyệt" filled blue
      case RecruitmentRequestStatusEnum.PENDING:
        return (
          <>
            <Button
              isIconOnly

              variant="flat"
              className="rounded-lg h-8 w-8 min-w-8"
              isLoading={isRejecting || isFetchingList}
              onPress={() => openConfirm(
                {
                  title: t('recruitment_request.confirm.reject_title'),
                  description: t('recruitment_request.confirm.reject_description'),
                  confirmLabel: t('recruitment_request.actions.reject'),
                  confirmColor: 'danger',
                  requireReason: true,
                },
                async (reason) => reject({ rejectionReason: reason ?? '' }),
              )}
            >
              <IconX size={16} color="#F31260" />
            </Button>
            <Button color="primary" className={BTN_BASE} isLoading={isApproving || isFetchingList} onPress={() => approve(undefined)}>
              {t('recruitment_request.actions.approve')}
            </Button>
          </>
        );
      // Nháp: "Gửi duyệt" filled blue
      case RecruitmentRequestStatusEnum.DRAFT:
        return (
          <Button color="primary" className={BTN_BASE} isLoading={isSubmitting || isFetchingList} onPress={() => submit(undefined)}>
            {t('recruitment_request.actions.submit_review')}
          </Button>
        );
      // Từ chối duyệt: "Gửi duyệt lại" filled primary
      case RecruitmentRequestStatusEnum.REJECTED:
        return (
          <Button color="primary" className={BTN_BASE} isLoading={isSubmitting || isFetchingList} onPress={() => submit(undefined)}>
            {t('recruitment_request.actions.resubmit_review')}
          </Button>
        );
      // Đã duyệt: "Mở tuyển" filled primary
      case RecruitmentRequestStatusEnum.APPROVED:
        return (
          <Button color="primary" className={BTN_BASE} isLoading={isOpeningRecruiting || isFetchingList} onPress={() => openRecruiting(undefined)}>
            {t('recruitment_request.actions.start_recruiting')}
          </Button>
        );
      // Đang tuyển: "Tạm dừng" bordered primary
      case RecruitmentRequestStatusEnum.RECRUITING:
        return (
          <Button variant="bordered" color="primary" className={BTN_BASE} isLoading={isPausing || isFetchingList} onPress={() => pause(undefined)}>
            {t('recruitment_request.actions.pause')}
          </Button>
        );
      // Tạm dừng: "Mở lại" bordered primary
      case RecruitmentRequestStatusEnum.PAUSED:
        return (
          <Button variant="bordered" color="primary" className={BTN_BASE} isLoading={isResuming || isFetchingList} onPress={() => resume(undefined)}>
            {t('recruitment_request.actions.resume')}
          </Button>
        );
      // Đã đóng / Hủy: "Xem chi tiết" bordered primary
      case RecruitmentRequestStatusEnum.CLOSED:
      case RecruitmentRequestStatusEnum.CANCELLED:
        return (
          <Button variant="bordered" color="primary" className={BTN_BASE}>
            {t('recruitment_request.actions.view_detail')}
          </Button>
        );
      default:
        return null;
    }
  };
  const handleCloseRequest = () => {
    openConfirm(
      {
        title: t('recruitment_request.confirm.close_title'),
        description: t('recruitment_request.confirm.close_description'),
        confirmLabel: t('recruitment_request.actions.close'),
        confirmColor: 'danger',
        requireReason: true,
      },
      async (reason) => closeRequest(undefined),
    )
  }
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
              onOpen(DrawerType.RECRUITMENT_REQUEST_MUTATE,
                { id: dataRow?.id })
            }
          },
          {
            key: 'delete',
            label: t('recruitment_request.actions.delete'), icon: <IconTrash size={16} />, color: 'danger'
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
      onClick: () => { setMode(ControlMode.view); onOpen(DrawerType.RECRUITMENT_REQUEST_MUTATE, { id: dataRow?.id }) }
    });

    return items;
  };

  const dropdownItems = getDropdownItems();

  return (
    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
      {renderActions()}
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly variant="light" className="rounded-lg h-8 w-8 min-w-8">
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
    </div>
  );
};
