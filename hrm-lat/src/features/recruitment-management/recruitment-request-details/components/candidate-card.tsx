import type { FC } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Tooltip } from '@heroui/react';
import { IconDots } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import { formatDate } from '@/lib/utils';
import { useDrawer } from '@/store/useDrawer';

import { CANDIDATE_ROW_ACTION_CONFIG } from '../../constants/candidate.constants';
import { useCandidateUpdateStatus } from '../hooks/use-candidate-update-status';
import { MainNavigateEnum, type ICandidate } from '../types/candidate.type';

interface CandidateCardProps {
  candidate: ICandidate;
}

export const CandidateCard: FC<CandidateCardProps> = ({ candidate }) => {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const { mutate: updateStatus, isPending } = useCandidateUpdateStatus();
  const { onOpen } = useDrawer();
  const navigate = useNavigate();

  const config = CANDIDATE_ROW_ACTION_CONFIG[candidate.status];

  const handleMainAction = () => {
    if (!config) return;
    if (config.mainStatusTo) {
      updateStatus({ id: candidate.id, status: config.mainStatusTo });
      return;
    }
    if (config.mainDrawer) {
      onOpen(config.mainDrawer, { candidateId: candidate.id, candidateName: candidate.name, candidateStatus: candidate.status, candidateEmail: candidate.email });
      return;
    }
    if (config.mainNavigate === MainNavigateEnum.DETAIL) {
      navigate({ to: `/admin/recruitment-management/candidate/${candidate.id}` });
    }
    if (config.mainNavigate === MainNavigateEnum.SCHEDULE) {
      navigate({ to: `/admin/recruitment-management/interview-schedule`, search: { candidateId: candidate.id } });
    }
  };

  const handleSecondaryAction = (action: NonNullable<typeof config>['secondary'][number]) => {
    if (action.statusTo) {
      updateStatus({ id: candidate.id, status: action.statusTo });
      return;
    }
    if (action.drawer) {
      onOpen(action.drawer, { candidateId: candidate.id, candidateName: candidate.name });
      return;
    }
    if (action.navigate === 'detail') {
      navigate({ to: `/admin/recruitment-management/candidate/${candidate.id}` });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E4E4E7] p-4 flex flex-col gap-3">
      <div className="flex flex-col items-start justify-between">
        <div className="flex w-full justify-between">
          <p className="font-medium text-sm text-[#11181C]">{candidate.name}</p>
          {config && config.secondary.length > 0 ? (
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light" className="rounded-lg h-7 w-7 min-w-7 -mr-1 -mt-1">
                  <IconDots size={16} color="#71717A" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="secondary actions">
                {config.secondary.map((action) => (
                  <DropdownItem
                    key={action.key}
                    startContent={action.icon}
                    color={action.color}
                    className={action.color === 'danger' ? 'text-danger' : ''}
                    onPress={() => handleSecondaryAction(action)}
                  >
                    {t(action.labelKey as any)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Button isIconOnly size="sm" variant="light" className="rounded-lg h-7 w-7 min-w-7 -mr-1 -mt-1" isDisabled>
              <IconDots size={16} color="#71717A" />
            </Button>
          )}
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

      {config && (
        <Button
          size="sm"
          variant="bordered"
          color={config.mainColor ?? 'primary'}
          className="w-full rounded-xl text-sm font-medium border-1"
          isLoading={isPending}
          onPress={handleMainAction}
        >
          {t(config.mainLabelKey as any)}
        </Button>
      )}
    </div>
  );
};
