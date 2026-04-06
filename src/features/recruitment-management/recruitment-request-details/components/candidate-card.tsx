import type { FC } from 'react';
import { Button } from '@heroui/react';
import { IconDots } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';
import { formatDate } from '@/lib/utils';
import { CandidateStatusEnum, type Candidate } from '../types/type';
import { useCandidateUpdateStatus } from '../hooks/use-candidate-update-status';
import { useParams } from '@tanstack/react-router';

interface CandidateCardProps {
  candidate: Candidate;
}

const NEXT_STATUS: Partial<Record<CandidateStatusEnum, CandidateStatusEnum>> = {
  [CandidateStatusEnum.APPLIED]: CandidateStatusEnum.SCREENED,
  [CandidateStatusEnum.SCREENED]: CandidateStatusEnum.WAITING_INTERVIEW,
  [CandidateStatusEnum.WAITING_OFFER]: CandidateStatusEnum.PROBATION_PROPOSED,
  [CandidateStatusEnum.PROBATION_PROPOSED]: CandidateStatusEnum.ON_PROBATION,
};

const ACTION_LABEL: Record<CandidateStatusEnum, string> = {
  [CandidateStatusEnum.APPLIED]: 'candidate.actions.screen',
  [CandidateStatusEnum.SCREENED]: 'candidate.actions.schedule_interview',
  [CandidateStatusEnum.WAITING_INTERVIEW]: 'candidate.actions.view_schedule',
  [CandidateStatusEnum.INTERVIEWING]: 'candidate.actions.view_schedule',
  [CandidateStatusEnum.WAITING_OFFER]: 'candidate.actions.send_offer',
  [CandidateStatusEnum.PROBATION_PROPOSED]: 'candidate.actions.send_offer',
  [CandidateStatusEnum.ON_PROBATION]: 'candidate.actions.accept_official',
  [CandidateStatusEnum.REJECTED]: 'candidate.actions.view_detail',
  [CandidateStatusEnum.OFFER_DECLINED]: 'candidate.actions.view_detail',
};

export const CandidateCard: FC<CandidateCardProps> = ({ candidate }) => {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const { id } = useParams({ strict: false })
  const { mutate: updateStatus, isPending } = useCandidateUpdateStatus(id as string);

  return (
    <div className="bg-white rounded-2xl border border-[#E4E4E7] p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-sm text-[#11181C]">{candidate.name}</p>
          <p className="text-xs text-[#71717A] mt-0.5">
            {t('candidate.applied_date')}: {formatDate(candidate.createdAt)}
          </p>
        </div>
        <Button isIconOnly size="sm" variant="light" className="rounded-lg h-7 w-7 min-w-7 -mr-1 -mt-1">
          <IconDots size={16} color="#71717A" />
        </Button>
      </div>
      <hr className="border-[#11111126]" />
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div>
          <div className="text-[#71717A]">{t('candidate.position')}: </div>
          <div className="text-[#11181C] font-medium">{candidate.position}</div>
        </div>
        <div>
          <div className="text-[#71717A]">{t('candidate.department')}: </div>
          <div className="text-[#11181C] font-medium">{candidate.departmentName}</div>
        </div>
      </div>

      <Button
        size="sm"
        variant="bordered"
        color="primary"
        className="w-full rounded-xl text-sm font-medium border-1"
        isDisabled={!NEXT_STATUS[candidate.status]}
        onPress={() => {
          const nextStatus = NEXT_STATUS[candidate.status];
          if (nextStatus) updateStatus({ id: candidate.id, status: nextStatus });
        }}
      >
        {t(ACTION_LABEL[candidate.status] as any)}
      </Button>
    </div>
  );
};
