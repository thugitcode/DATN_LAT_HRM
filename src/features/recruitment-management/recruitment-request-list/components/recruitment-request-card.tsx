import type { FC } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import {
  Progress,
} from '@heroui/react';
import {
  IconCalendar,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { formatDate } from '@/lib/utils';

import { type RecruitmentRequest } from '../types/type';
import { RecruitmentRequestStatusChip } from './recruitment-request-status-chip';
import { RecruitmentRequestActionButtons, RecruitmentRequestActionDropdown } from './row-recruitment-request-actions';
import { useNavigate } from '@tanstack/react-router';

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
  const navigate = useNavigate();

  const daysRemaining = getDaysRemaining(data.requiredDate);
  const progress = getProgress(data.requiredDate, data.createdAt);

  const handleCardClick = () => {
    navigate({ to: `/admin/recruitment-management/recruitment-request/${data.id}` });
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm p-3 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      {/* Header: Status + Menu */}
      <div className="flex items-center justify-between">
        <RecruitmentRequestStatusChip status={data.status} />
        <RecruitmentRequestActionDropdown dataRow={data} />
      </div>

      {/* Position Info */}
      <div className="flex flex-col">
        <span className="text-base font-medium text-[#11181C] leading-6">{data.position}</span>
        <div className="flex items-center gap-2 text-sm text-[#71717A] leading-5">
          <span>{data.workType}</span>
          <span className="size-1 rounded-full bg-[#71717A]" />
          <span>{data?.salaryFrom ?? '-'} - {data?.salaryTo ?? '-'}</span>
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
        <RecruitmentRequestActionButtons dataRow={data} size="sm" className="flex-1" />
      </div>
    </div>
  );
};

