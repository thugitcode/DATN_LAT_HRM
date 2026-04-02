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

import { RecruitmentRequestStatusEnum, type RecruitmentRequest } from '../type';

const BTN_BASE = 'rounded-xl font-medium h-8 w-[120px] text-sm';

interface RowRecruitmentRequestActionsProps {
  dataRow?: RecruitmentRequest;
}

export const RowRecruitmentRequestActions: FC<RowRecruitmentRequestActionsProps> = ({
  dataRow,
}) => {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  if (!dataRow) return null;

  const renderActions = () => {
    switch (dataRow.status) {
      // Chờ duyệt: nút X đỏ (reject) + "Duyệt" filled blue
      case RecruitmentRequestStatusEnum.PENDING:
        return (
          <>
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              className="rounded-lg h-8 w-8 min-w-8"
            >
              <IconX size={16} color="#F31260" />
            </Button>
            <Button size="sm" color="primary" className={BTN_BASE}>
              {t('recruitment_request.actions.approve')}
            </Button>
          </>
        );
      // Nháp: "Gửi duyệt" filled blue
      case RecruitmentRequestStatusEnum.DRAFT:
        return (
          <Button size="sm" color="primary" className={BTN_BASE}>
            {t('recruitment_request.actions.submit_review')}
          </Button>
        );
      // Từ chối duyệt: "Gửi duyệt lại" filled primary
      case RecruitmentRequestStatusEnum.REJECTED:
        return (
          <Button size="sm" color="primary" className={BTN_BASE}>
            {t('recruitment_request.actions.resubmit_review')}
          </Button>
        );
      // Đã duyệt: "Mở tuyển" filled primary
      case RecruitmentRequestStatusEnum.APPROVED:
        return (
          <Button size="sm" color="primary" className={BTN_BASE}>
            {t('recruitment_request.actions.start_recruiting')}
          </Button>
        );
      // Đang tuyển: "Tạm dừng" bordered primary
      case RecruitmentRequestStatusEnum.RECRUITING:
        return (
          <Button size="sm" variant="bordered" color="primary" className={BTN_BASE}>
            {t('recruitment_request.actions.pause')}
          </Button>
        );
      // Tạm dừng: "Mở lại" bordered primary
      case RecruitmentRequestStatusEnum.PAUSED:
        return (
          <Button size="sm" variant="bordered" color="primary" className={BTN_BASE}>
            {t('recruitment_request.actions.resume')}
          </Button>
        );
      // Đã đóng / Hủy: "Xem chi tiết" bordered primary
      case RecruitmentRequestStatusEnum.CLOSED:
      case RecruitmentRequestStatusEnum.CANCELLED:
        return (
          <Button size="sm" variant="bordered" color="primary" className={BTN_BASE}>
            {t('recruitment_request.actions.view_detail')}
          </Button>
        );
      default:
        return null;
    }
  };

  const getDropdownItems = () => {
    const items: { key: string; label: string; icon: React.ReactNode; color?: 'danger' }[] = [];

    switch (dataRow.status) {
      case RecruitmentRequestStatusEnum.DRAFT:
        items.push(
          { key: 'edit', label: t('recruitment_request.actions.edit'), icon: <IconEdit size={16} /> },
          { key: 'delete', label: t('recruitment_request.actions.delete'), icon: <IconTrash size={16} />, color: 'danger' },
        );
        break;
      case RecruitmentRequestStatusEnum.PENDING:
        items.push(
          { key: 'revoke', label: t('recruitment_request.actions.revoke'), icon: <IconX size={16} /> },
          { key: 'print', label: t('recruitment_request.actions.print'), icon: <IconPrinter size={16} /> },
        );
        break;
      case RecruitmentRequestStatusEnum.REJECTED:
        items.push(
          { key: 'view_reason', label: t('recruitment_request.actions.view_reason'), icon: <IconEye size={16} /> },
          { key: 'edit', label: t('recruitment_request.actions.edit'), icon: <IconEdit size={16} /> },
        );
        break;
      case RecruitmentRequestStatusEnum.APPROVED:
        items.push(
          { key: 'edit_limited', label: t('recruitment_request.actions.edit_limited'), icon: <IconEdit size={16} /> },
        );
        break;
      case RecruitmentRequestStatusEnum.RECRUITING:
        items.push(
          { key: 'close', label: t('recruitment_request.actions.close'), icon: <IconX size={16} /> },
          { key: 'view_candidates', label: t('recruitment_request.actions.view_candidates'), icon: <IconUsers size={16} /> },
        );
        break;
      case RecruitmentRequestStatusEnum.PAUSED:
        items.push(
          { key: 'close', label: t('recruitment_request.actions.close'), icon: <IconX size={16} /> },
        );
        break;
      case RecruitmentRequestStatusEnum.CLOSED:
      case RecruitmentRequestStatusEnum.CANCELLED:
        items.push(
          { key: 'duplicate', label: t('recruitment_request.actions.duplicate'), icon: <IconCopy size={16} /> },
        );
        break;
    }

    items.push({
      key: 'view_detail',
      label: t('recruitment_request.actions.view_detail'),
      icon: <IconEye size={16} />,
    });

    return items;
  };

  const dropdownItems = getDropdownItems();

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      {renderActions()}
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly size="sm" variant="light" className="rounded-lg h-8 w-8 min-w-8">
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
            >
              {item.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
