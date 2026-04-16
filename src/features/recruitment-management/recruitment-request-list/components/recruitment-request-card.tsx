import { NAMESPACES } from '@/i18n/constants';
import { Progress, Tooltip } from '@heroui/react';
import { motion } from 'framer-motion';
import { useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';

import { formatDate, getProgress } from '@/lib/utils';

import { useShortPriceFormatter, type Locale } from '@/hooks/common/use-short-price-formatter';
import { icons } from '@/lib/icons';
import { useNavigate } from '@tanstack/react-router';
import { type RecruitmentRequest } from '../types/type';
import { RecruitmentRequestStatusChip } from './recruitment-request-status-chip';
import { RecruitmentRequestActionButtons, RecruitmentRequestActionDropdown } from './row-recruitment-request-actions';
import dayjs from 'dayjs';

interface RecruitmentRequestCardProps {
  data: RecruitmentRequest;
}

const getDaysRemaining = (requiredDate: string): number => {
  const now = new Date();
  const target = new Date(requiredDate);
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const RecruitmentRequestCard: FC<RecruitmentRequestCardProps> = ({ data }) => {
  const { t, i18n } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  const navigate = useNavigate();
  const { format } = useShortPriceFormatter(i18n.language as Locale)
  const progress = getProgress(data.requiredDate, data.createdAt);
  // const daysRemaining = getDaysRemaining(data.requiredDate);
  const daysRemaining = useMemo(() => {
    if (!data?.requiredDate) return 0;
    return dayjs(data.requiredDate).diff(dayjs(), 'day');
  }, [data?.requiredDate]);
  const handleCardClick = () => {
    navigate({ to: `/admin/recruitment-management/recruitment-request/${data.id}` });
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative bg-white dark:bg-[#18181B] rounded-2xl border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] p-4 flex flex-col gap-4 cursor-pointer hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_10px_10px_-5px_rgba(0,0,0,0.02)] transition-all duration-300 ring-1 ring-transparent hover:ring-primary/20"
      onClick={handleCardClick}
    >
      {/* Top Section: Status & Actions */}
      <div className="flex items-center justify-between">
        <RecruitmentRequestStatusChip status={data.status} />
        <div className="flex items-center gap-1">
          <RecruitmentRequestActionDropdown dataRow={data} />
        </div>
      </div>

      {/* Main Info */}
      <div className="flex flex-col gap-1.5 flex-1">
        <Tooltip content={data.position || data?.jobTitle?.name}>
          <h3 className="text-[#11181C] dark:text-[#ECEDEE]  group-hover:text-primary transition-colors line-clamp-1 text-base leading-6 font-medium w-fit min-h-6">
            {data.position || data?.jobTitle?.name}
          </h3>
        </Tooltip>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[#71717A] dark:text-[#A1A1AA]">
          <div className="flex items-center gap-1">
            {/* <IconBriefcase size={14} /> */}
            <span>{t(`form.options.work_type.${data.workType}`)}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-primary" />
          <div className="flex items-center gap-1">
            {/* <IconCurrencyDollar size={14} /> */}
            <span className="text-small">
              {format(data?.salaryFrom, { compact: true, currency: true }) ?? '-'} - {format(data?.salaryTo, { compact: true, currency: true }) ?? '-'}
            </span>
          </div>
          <span className="w-1 h-1 rounded-full bg-primary" />
          <div className="flex items-center gap-1 text-small">
            {/* <IconUsers size={14} /> */}
            <span>{t('recruitment_request.card.people_count', { count: data.quantity })}</span>
          </div>
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
            {data?.waitingInterviewCount > 0 ? data?.waitingInterviewCount : '--'}
          </span>
          <span className="text-xs text-black leading-4">
            {t('recruitment_request.card.interviews')}
          </span>
        </div>
      </div>

      {/* Progress & Deadline */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-1.5 text-[#71717A] dark:text-[#A1A1AA]">
            {icons.calendar}
            <span className="text-[#A1A1AA]">{t('recruitment_request.card.required_date')}</span>
            <span>{formatDate(data.requiredDate)}</span>
          </div>
          <div className={`font-semibold ${daysRemaining <= 3 ? 'text-danger' : 'text-primary'}`}>
            {daysRemaining <= 0 ? t('recruitment_request.card.days_overdue', { count: Math.abs(daysRemaining) }) : t('recruitment_request.card.days_remaining', { count: daysRemaining })}
          </div>
        </div>

        <Progress
          size="sm"
          value={progress}
          color={daysRemaining <= 3 ? 'danger' : 'primary'}
          classNames={{
            base: 'max-w-md',
            track: 'drop-shadow-sm h-1.5',
            indicator: 'bg-gradient-to-r from-primary to-primary-400',
          }}
        />
      </div>

      {/* Footer: Creator + Action */}
      <div className="flex items-center justify-between gap-2">
        {data.createdByStaffName ? <div className='flex gap-2'>
          <span className="text-xs text-[#A1A1AA]">{t('recruitment_request.card.created_by')}</span>
          <span className="text-xs text-black flex-1 line-clamp-2">{data.createdByStaffName}</span>
        </div> : <div></div>}
        <RecruitmentRequestActionButtons dataRow={data} size="sm" className="w-fit" />
      </div>
    </motion.div>
  );
};



