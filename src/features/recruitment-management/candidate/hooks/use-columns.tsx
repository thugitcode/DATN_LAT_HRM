import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from '@tanstack/react-router';

import { NAMESPACES } from '@/i18n/constants';
import { formatDate } from '@/lib/utils';
import type { ColumnDef } from '@/components/data-table/data-table';
import { Button, Chip } from '@heroui/react';

import { useCandidateUpdateStatus } from '../../recruitment-request-details/hooks/use-candidate-update-status';
import { CandidateStatusEnum, type Candidate } from '../../recruitment-request-details/types/type';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEY } from '@/hooks/use-crud-query';

const STATUS_CHIP: Record<
  CandidateStatusEnum,
  { label: string; color: 'primary' | 'secondary' | 'warning' | 'success' | 'danger' | 'default' }
> = {
  [CandidateStatusEnum.APPLIED]: { label: 'candidate.status.applied', color: 'primary' },
  [CandidateStatusEnum.SCREENED]: { label: 'candidate.status.screened', color: 'secondary' },
  [CandidateStatusEnum.WAITING_INTERVIEW]: { label: 'candidate.status.waiting_interview', color: 'warning' },
  [CandidateStatusEnum.INTERVIEWING]: { label: 'candidate.status.interviewing', color: 'success' },
  [CandidateStatusEnum.WAITING_OFFER]: { label: 'candidate.status.waiting_offer', color: 'success' },
  [CandidateStatusEnum.PROBATION_PROPOSED]: { label: 'candidate.status.probation_proposed', color: 'primary' },
  [CandidateStatusEnum.ON_PROBATION]: { label: 'candidate.status.on_probation', color: 'default' },
  [CandidateStatusEnum.REJECTED]: { label: 'candidate.status.rejected', color: 'danger' },
  [CandidateStatusEnum.OFFER_DECLINED]: { label: 'candidate.status.offer_declined', color: 'danger' },
};

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

function ActionsCell({ candidate }: { candidate: Candidate }) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const { id } = useParams({ strict: false });
  const { mutate: updateStatus, isPending } = useCandidateUpdateStatus(id as string);
  const queryClient = useQueryClient()
  return (
    <div className='flex flex-end justify-end'>
      <Button
        size="sm"
        variant="bordered"
        color="primary"
        className="rounded-xl text-xs font-medium border-1 whitespace-nowrap"
        isDisabled={!NEXT_STATUS[candidate.status] || isPending}
        onPress={() => {
          const nextStatus = NEXT_STATUS[candidate.status];
          if (nextStatus) updateStatus({ id: candidate.id, status: nextStatus }, {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: [QUERY_KEY.CANDIDATE, 'list'] })
            }
          });
        }}
      >
        {t(ACTION_LABEL[candidate.status] as any)}
      </Button>
    </div>
  );
}

export const useCandidateColumns = () => {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  const columns: ColumnDef<Candidate>[] = useMemo(
    () => [
      {
        key: 'code',
        title: t('candidate.columns.code'),
        minWidth: 120,
        render: (_, row) => <span className="text-sm text-[#11181C] whitespace-nowrap">{row.code}</span>,
      },
      {
        key: 'name',
        title: t('candidate.columns.name'),
        minWidth: 160,
        render: (_, row) => <span className="text-sm text-[#11181C] whitespace-nowrap">{row.name}</span>,
      },
      {
        key: 'phone',
        title: t('candidate.columns.phone'),
        minWidth: 130,
        render: (_, row) => <span className="text-sm text-[#11181C] whitespace-nowrap">{row.phone ?? '—'}</span>,
      },
      {
        key: 'email',
        title: t('candidate.columns.email'),
        minWidth: 180,
        render: (_, row) => <span className="text-sm text-[#11181C]">{row.email ?? '—'}</span>,
      },
      {
        key: 'position',
        title: t('candidate.columns.position'),
        minWidth: 140,
        render: (_, row) => <span className="text-sm text-[#11181C] whitespace-nowrap">{row.position}</span>,
      },
      {
        key: 'departmentName',
        title: t('candidate.columns.departmentName'),
        minWidth: 160,
        render: (_, row) => <span className="text-sm text-[#11181C] whitespace-nowrap">{row.departmentName ?? '—'}</span>,
      },
      {
        key: 'roomName',
        title: t('candidate.columns.roomName'),
        minWidth: 120,
        render: (_, row) => <span className="text-sm text-[#11181C] whitespace-nowrap">{row.roomName ?? '—'}</span>,
      },
      {
        key: 'source',
        title: t('candidate.columns.source'),
        minWidth: 100,
        render: (_, row) =>
          row.source ? (
            <Chip size="sm" variant="flat" color="default">{row.source}</Chip>
          ) : '—',
      },
      {
        key: 'status',
        title: t('candidate.columns.status'),
        minWidth: 150,
        render: (_, row) => {
          const chip = STATUS_CHIP[row.status];
          return (
            <Chip size="sm" variant="flat" color={chip.color}>
              {t(chip.label as any)}
            </Chip>
          );
        },
      },
      {
        key: 'createdAt',
        title: t('candidate.columns.createdAt'),
        minWidth: 130,
        render: (_, row) => <span className="text-sm text-[#11181C] whitespace-nowrap">{formatDate(row.createdAt)}</span>,
      },
      {
        key: 'actions',
        title: t('candidate.columns.actions'),
        minWidth: 160,
        hideable: false,
        sticky: 'right',
        render: (_, row) => <ActionsCell candidate={row} />,
      },
    ],
    [t],
  );

  return { columns };
};
