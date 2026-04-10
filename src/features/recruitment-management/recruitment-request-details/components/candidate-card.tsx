import { Button, Tooltip } from '@heroui/react';
import { IconDots } from '@tabler/icons-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';
import { formatDate } from '@/lib/utils';
import { ACTION_CANDIDATE_LABEL, NEXT_CANDIDATE_STATUS } from '../constants/data';
import { useCandidateUpdateStatus } from '../hooks/use-candidate-update-status';
import { type ICandidate } from '../types/candidate.type';

interface CandidateCardProps {
  candidate: ICandidate;
}

export const CandidateCard: FC<CandidateCardProps> = ({ candidate }) => {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const { mutate: updateStatus, isPending } = useCandidateUpdateStatus();

  return (
    <div className="bg-white rounded-2xl border border-[#E4E4E7] p-4 flex flex-col gap-3">
      <div className="flex flex-col items-start justify-between">
        <div className='flex w-full justify-between'>
          <p className="font-medium text-sm text-[#11181C]">{candidate.name}</p>
          <Button isIconOnly size="sm" variant="light" className="rounded-lg h-7 w-7 min-w-7 -mr-1 -mt-1">
            <IconDots size={16} color="#71717A" />
          </Button>
        </div>
        <p className="text-xs text-[#71717A] mt-0.5">
          {t('candidate.applied_date')}: {formatDate(candidate.createdAt)}
        </p>


      </div>
      <hr className="border-[#11111126]" />
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div>
          <div className="text-[#71717A]">{t('candidate.position')}: </div>
          <Tooltip content={candidate.position}>
            <div className="text-[#11181C] font-medium truncate">{candidate.position}</div>
          </Tooltip>
        </div>
        <div>
          <div className="text-[#71717A]">{t('candidate.department')}: </div>
          <Tooltip content={candidate.departmentName}>
            <div className="text-[#11181C] font-medium truncate">{candidate.departmentName}</div>
          </Tooltip>
        </div>
      </div>

      <Button
        size="sm"
        variant="bordered"
        color="primary"
        className="w-full rounded-xl text-sm font-medium border-1"
        isDisabled={!NEXT_CANDIDATE_STATUS[candidate.status]}
        onPress={() => {
          const nextStatus = NEXT_CANDIDATE_STATUS[candidate.status];
          if (nextStatus) updateStatus({ id: candidate.id, status: nextStatus });
        }}
      >
        {t(ACTION_CANDIDATE_LABEL[candidate.status] as any)}
      </Button>
    </div>
  );
};
