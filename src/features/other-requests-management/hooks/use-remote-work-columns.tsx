// useRemoteWorkColumns.tsx
import { useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import { toDDMMYYYY } from '@/lib/utils';
import type { ColumnDef } from '@/components/data-table/data-table';
import { StatusChip } from '@/components/status-chip';

import type { RemoteWork } from '../types/remote-work.type';

export const useRemoteWorkColumns = () => {
  const { t } = useTranslation(NAMESPACES.OTHER_REQUESTS_MANGAGEMENT);

  const columns: ColumnDef<RemoteWork>[] = useMemo(
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
        key: 'type',
        title: t('columns.type'),
        minWidth: 120,
      },
      {
        key: 'fromDate',
        title: t('columns.remoteDate'),
        minWidth: 160,
        render: (_, row) => (
          <span>
            {toDDMMYYYY(row.fromDate)} - {toDDMMYYYY(row.toDate)}
          </span>
        ),
      },
      {
        key: 'startTime',
        title: t('columns.startTime'),
        minWidth: 120,
      },
      {
        key: 'endTime',
        title: t('columns.endTime'),
        minWidth: 120,
      },
      {
        key: 'totalDays',
        title: t('columns.totalTime'),
        minWidth: 120,
        render: (_, row) => (
          <span>{row.totalDays != null ? `${row.totalDays} ${t('day')}` : '-'}</span>
        ),
      },
      {
        key: 'reason',
        title: t('columns.reason'),
        minWidth: 200,
        render: (_, row) => <span>{row.reason || '-'}</span>,
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
