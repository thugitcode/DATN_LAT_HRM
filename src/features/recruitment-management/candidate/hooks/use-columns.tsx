import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { ColumnDef } from '@/components/data-table/data-table';
import { NAMESPACES } from '@/i18n/constants';
import { formatDate } from '@/lib/utils';
import { Button, Chip } from '@heroui/react';

import { QUERY_KEY } from '@/hooks/use-crud-query';
import { useQueryClient } from '@tanstack/react-query';
import { useCandidateUpdateStatus } from '../../recruitment-request-details/hooks/use-candidate-update-status';
import { type ICandidate } from '../../recruitment-request-details/types/type';
import { ACTION_LABEL, NEXT_STATUS, STATUS_CHIP } from '../../constants/constants';
import dayjs from 'dayjs';
import type { InterviewSchedule } from '../../recruitment-request-details/types/interview.type';
import { INTERVIEW_STATUS_CONFIG } from '../../recruitment-request-details/constants/data';

function ActionsCell({ candidate }: { candidate: ICandidate }) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const { mutate: updateStatus, isPending } = useCandidateUpdateStatus();
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

  const columns: ColumnDef<ICandidate>[] = useMemo(
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
        render: (_, row) => <span className="text-sm text-[#11181C] whitespace-nowrap">{t(`candidate.source.${row.source}`)}</span>
      },
      {
        key: 'status',
        title: t('candidate.columns.status'),
        minWidth: 150,
        render: (_, row) => {
          const chip = STATUS_CHIP[row.status];
          return (
            <Chip size="sm" variant="flat" color={chip.color}>
              {t(chip.label)}
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

  const columnsHistory: ColumnDef<InterviewSchedule>[] = useMemo(
    () => [
      {
        key: 'stt',
        title: t('interview_schedule.detail.stt'),
        minWidth: 60,
        render: (_, __, index) => (
          <span className="text-sm text-[#11181C]">{index + 1}</span>
        ),
      },
      {
        key: 'interviewTime',
        title: t('interview_schedule.detail.time'), // THỜI GIAN
        minWidth: 160,
        render: (_, row) => (
          <span className="text-sm text-[#11181C]">
            {/* Giả sử bạn dùng format: HH:mm DD/MM/YYYY */}
            {dayjs(row.interviewDate).format('HH:mm DD/MM/YYYY')}
          </span>
        ),
      },
      {
        key: 'interviewer',
        title: t('interview_schedule.detail.interviewer'), // NGƯỜI PHỎNG VẤN
        minWidth: 200,
        render: (_, row) => (
          <span className="text-sm text-[#11181C]">
            {row.interviewerName || '—'}
          </span>
        ),
      },
      {
        key: 'method',
        title: t('interview_schedule.detail.method'), // HÌNH THỨC
        minWidth: 120,
        render: (_, row) => (
          <span className="text-sm text-[#11181C]">
            {row.interviewMethod || 'Online'}
          </span>
        ),
      },
      {
        key: 'status',
        title: t('interview_schedule.detail.status'), // TRẠNG THÁI
        minWidth: 150,
        render: (_, row) => {
          const chip = INTERVIEW_STATUS_CONFIG[row.status];
          return (
            <Chip
              size="sm"
              variant="flat"
              color={chip?.chipColor || "default"}
            >
              {t(`interview_schedule.status.${row.status}`)}
            </Chip>
          );
        },
      },
    ],
    [t]
  );
  return { columns, columnsHistory };
};
