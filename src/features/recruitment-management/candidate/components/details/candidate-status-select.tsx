import { useTranslation } from 'react-i18next';
import { addToast } from '@heroui/react';

import { NAMESPACES } from '@/i18n/constants';
import { StatusChipSelect } from '@/components/status-chip-select';
import { CandidateStatusEnum } from '@/features/recruitment-management/recruitment-request-details/types/type';
import { STATUS_BADGE } from '@/features/recruitment-management/constants/details';
import { useCandidateUpdateStatus } from '@/features/recruitment-management/recruitment-request-details/hooks/use-candidate-update-status';

interface CandidateStatusSelectProps {
  candidateId: string;
  status: CandidateStatusEnum;
  onSelect?: (status: CandidateStatusEnum) => void
}

export function CandidateStatusSelect({ candidateId, status, onSelect }: CandidateStatusSelectProps) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT) as any;
  const { mutate: updateStatus, isPending } = useCandidateUpdateStatus();

  const options = Object.values(CandidateStatusEnum).map((s) => ({
    key: s,
    label: t(STATUS_BADGE[s].label),
    color: STATUS_BADGE[s].color,
    bg: STATUS_BADGE[s].bg,
  }));

  const handleSelect = (key: string) => {
    updateStatus(
      { id: candidateId, status: key as CandidateStatusEnum },
      {
        onError: () => {
          addToast({ title: t('candidate.status.update_error'), color: 'danger' });
        },
        onSuccess: () => {
          onSelect?.(key as CandidateStatusEnum)
        }
      },
    );
  };

  return (
    <StatusChipSelect
      value={status}
      options={options}
      onSelect={handleSelect}
      isPending={isPending}
    />
  );
}
