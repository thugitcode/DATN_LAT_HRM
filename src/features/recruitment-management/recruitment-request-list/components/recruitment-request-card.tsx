import type { FC } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Progress,
} from '@heroui/react';
import {
  IconCalendar,
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

import { formatDate } from '@/lib/utils';

import { RecruitmentRequestStatusEnum, type RecruitmentRequest } from '../type';
import { RecruitmentRequestStatusChip } from './recruitment-request-status-chip';

interface RecruitmentRequestCardProps {
  data: RecruitmentRequest;
}

const getDaysRemaining = (requiredDate: string): number => {
  const now = new Date();
  const target = new Date(requiredDate);
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const getProgress = (requiredDate: string, createdAt: string): number => {
  const now = new Date().getTime();
  const start = new Date(createdAt).getTime();
  const end = new Date(requiredDate).getTime();
  if (end <= start) return 100;
  const elapsed = now - start;
  const total = end - start;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
};

export const RecruitmentRequestCard: FC<RecruitmentRequestCardProps> = ({ data }) => {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  const daysRemaining = getDaysRemaining(data.requiredDate);
  const progress = getProgress(data.requiredDate, data.createdAt);

  const renderActionButton = () => {
    switch (data.status) {
      case RecruitmentRequestStatusEnum.DRAFT:
        return (
          <Button size="sm" color="primary" className="rounded-xl font-normal h-9 flex-1 text-sm">
            {t('recruitment_request.actions.submit_review')}
          </Button>
        );
      case RecruitmentRequestStatusEnum.PENDING:
        return (
          <Button size="sm" color="primary" className="rounded-xl font-normal h-9 flex-1 text-sm">
            {t('recruitment_request.actions.approve')}
          </Button>
        );
      case RecruitmentRequestStatusEnum.REJECTED:
        return (
          <Button size="sm" color="primary" className="rounded-xl font-normal h-9 flex-1 text-sm">
            {t('recruitment_request.actions.resubmit_review')}
          </Button>
        );
      case RecruitmentRequestStatusEnum.APPROVED:
        return (
          <Button size="sm" color="primary" className="rounded-xl font-normal h-9 flex-1 text-sm">
            {t('recruitment_request.actions.start_recruiting')}
          </Button>
        );
      case RecruitmentRequestStatusEnum.RECRUITING:
        return (
          <Button
            size="sm"
            variant="bordered"
            color="primary"
            className="rounded-xl font-normal h-9 flex-1 text-sm"
          >
            {t('recruitment_request.actions.pause')}
          </Button>
        );
      case RecruitmentRequestStatusEnum.PAUSED:
        return (
          <Button size="sm" color="primary" className="rounded-xl font-normal h-9 flex-1 text-sm">
            {t('recruitment_request.actions.resume')}
          </Button>
        );
      default:
        return null;
    }
  };

  const getDropdownItems = () => {
    const items: { key: string; label: string; icon: React.ReactNode; color?: 'danger' }[] = [];

    switch (data.status) {
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
    <div className="bg-white rounded-xl shadow-sm p-3 flex flex-col gap-3">
      {/* Header: Status + Menu */}
      <div className="flex items-center justify-between">
        <RecruitmentRequestStatusChip status={data.status} />
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

      {/* Position Info */}
      <div className="flex flex-col">
        <span className="text-base font-medium text-[#11181C] leading-6">{data.position}</span>
        <div className="flex items-center gap-2 text-sm text-[#71717A] leading-5">
          <span>{data.workType}</span>
          <span className="size-1 rounded-full bg-[#71717A]" />
          <span>{data.salaryRange}</span>
          <span className="size-1 rounded-full bg-[#71717A]" />
          <span>{t('recruitment_request.card.people_count', { count: data.quantity })}</span>
        </div>
      </div>

      {/* Stats Box */}
      <div className="flex items-stretch gap-3 bg-[#F4F4F5] border border-[rgba(17,17,17,0.15)] rounded-xl p-3">
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-xl font-medium text-black leading-7">
            {data.candidateCount > 0 ? data.candidateCount : '--'}
          </span>
          <span className="text-xs text-black leading-4">
            {t('recruitment_request.card.candidates')}
          </span>
        </div>
        <div className="w-px bg-[rgba(17,17,17,0.15)] self-stretch" />
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-xl font-medium text-black leading-7">
            {data.interviewCount > 0 ? data.interviewCount : '--'}
          </span>
          <span className="text-xs text-black leading-4">
            {t('recruitment_request.card.interviews')}
          </span>
        </div>
      </div>

      {/* Date + Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs">
          <IconCalendar size={16} color="#A1A1AA" />
          <span className="text-[#A1A1AA]">{t('recruitment_request.card.required_date')}</span>
          <span className="flex-1 text-black">{formatDate(data.requiredDate)}</span>
          <span className="text-black">
            {t('recruitment_request.card.days_remaining', { count: daysRemaining })}
          </span>
        </div>
        <Progress
          size="sm"
          value={progress}
          color="primary"
          classNames={{ track: 'h-[7px]', indicator: 'h-[7px]' }}
        />
      </div>

      {/* Footer: Creator + Action */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#A1A1AA]">{t('recruitment_request.card.created_by')}</span>
        <span className="text-xs text-black flex-1">{data.createdByName}</span>
        {renderActionButton()}
      </div>
    </div>
  );
};
