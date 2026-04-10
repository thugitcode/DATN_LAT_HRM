import { Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';
import {
  CandidateStatusEnum,
  type ICandidate,
} from '@/features/recruitment-management/recruitment-request-details/types/candidate.type';
import { useCandidateUpdateStatus } from '@/features/recruitment-management/recruitment-request-details/hooks/use-candidate-update-status';

import { PIPELINE_STEPS } from '@/features/recruitment-management/constants/details';
import { NEXT_STATUS } from '@/features/recruitment-management/constants/constants';

interface CandidatePipelineProps {
  candidate: ICandidate;
}

export function CandidatePipeline({ candidate }: CandidatePipelineProps) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT) as any;
  const { mutate: updateStatus, isPending } = useCandidateUpdateStatus();

  const pipelineIndex = PIPELINE_STEPS.findIndex((s) => s.key === candidate.status);
  const nextStatus = NEXT_STATUS[candidate.status];

  return (
    <div className="bg-white rounded-2xl border border-[#E4E4E7] p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-[#11181C]">{t('candidate.detail.pipeline')}</span>
        <div className="flex gap-2">
          {nextStatus && (
            <Button
              color="primary"
              size="sm"
              className="rounded-xl font-medium"
              isLoading={isPending}
              onPress={() => updateStatus({ id: candidate.id, status: nextStatus })}
            >
              {t('candidate.detail.advance')}
            </Button>
          )}
          <Button
            color="danger"
            variant="flat"
            size="sm"
            className="rounded-xl font-medium"
            isDisabled={candidate.status === CandidateStatusEnum.REJECTED}
            onPress={() => updateStatus({ id: candidate.id, status: CandidateStatusEnum.REJECTED })}
          >
            {t('candidate.detail.reject')}
          </Button>
        </div>
      </div>

      <div className="relative flex items-center">
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#E4E4E7] z-0" />
        <div
          className="absolute top-4 left-4 h-0.5 bg-primary z-0 transition-all"
          style={{
            width:
              pipelineIndex >= 0
                ? `calc(${(pipelineIndex / (PIPELINE_STEPS.length - 1)) * 100}% - 8px)`
                : '0%',
          }}
        />
        <div className="flex justify-between w-full relative z-10">
          {PIPELINE_STEPS.map((step, idx) => {
            const isDone = idx <= pipelineIndex;
            const isActive = idx === pipelineIndex;
            return (
              <div
                key={step.key}
                className="flex flex-col items-center gap-1.5"
                style={{ minWidth: 0, flex: 1 }}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all ${isActive || isDone
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white border-[#E4E4E7] text-[#71717A]'
                    }`}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
                <span
                  className={`text-[11px] text-center leading-tight ${isDone ? 'text-primary font-medium' : 'text-[#71717A]'
                    }`}
                >
                  {t(step.labelKey)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
