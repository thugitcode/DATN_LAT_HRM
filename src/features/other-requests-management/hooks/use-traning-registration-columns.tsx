import { useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { toDDMMYYYY } from '@/lib/utils';
import type { ColumnDef } from '@/components/data-table/data-table';
import { StatusChip } from '@/components/status-chip';

import type { TrainingRegistrantion } from '../types/training-registrantion.type';

export const useTrainingRegistrtionColumns = () => {
  const { t } = useTranslation(NAMESPACES.OTHER_REQUESTS_MANGAGEMENT);

  const columns: ColumnDef<TrainingRegistrantion>[] = useMemo(
    () => [
      {
        key: 'department',
        title: t('columns.department'),
        minWidth: 140,
      },
      {
        key: 'staffCode',
        title: t('columns.staffCode'),
        minWidth: 140,
        render: (_, row) => <span>{row.staffCode || '-'}</span>,
      },
      {
        key: 'staffName',
        title: t('columns.staffName'),
        minWidth: 180,
        render: (_, row) => <span>{row.staffName || '-'}</span>,
      },
      {
        key: 'courseName',
        title: t('columns.overtimeType'),
        minWidth: 160,
      },
      {
        key: 'fromDate',
        title: t('columns.startTime'),
        minWidth: 140,
        render: (_, row) => <span>{toDDMMYYYY(row.fromDate)}</span>,
      },
      {
        key: 'toDate',
        title: t('columns.endTime'),
        minWidth: 140,
        render: (_, row) => <span>{toDDMMYYYY(row.toDate)}</span>,
      },
      {
        key: 'totalDays',
        title: t('columns.totalTime'),
        minWidth: 120,
        render: (_, row) => {
          const days = dayjs(row.toDate).diff(dayjs(row.fromDate), 'day') + 1;
          return <span>{`${days} ${t('day')}`}</span>;
        },
      },
      {
        key: 'trainingCenter',
        title: t('columns.trainingLocation'),
        minWidth: 180,
        render: (_, row) => <span>{row.trainingCenter || '-'}</span>,
      },
      {
        key: 'note',
        title: t('columns.reason'),
        minWidth: 200,
        render: (_, row) => <span>{row.note || '-'}</span>,
      },
      {
        key: 'approvedByName',
        title: t('columns.directManager'),
        minWidth: 180,
        render: (_, row) => <span>{row.approvedByName || '-'}</span>,
      },
      {
        key: 'status',
        title: t('columns.status'),
        minWidth: 120,
        render: (_, row) => <StatusChip status={row?.status} />,
      },
    ],
    [t],
  );

  return { columns };
};
