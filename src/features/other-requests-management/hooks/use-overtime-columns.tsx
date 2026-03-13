import { useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import { toDDMMYYYY, toHHMM } from '@/lib/utils';
import type { ColumnDef } from '@/components/data-table/data-table';
import { StatusChip } from '@/components/status-chip';

import type { OverTime } from '../types/overtime.type';

export const useOvertimeColumns = () => {
  const { t } = useTranslation(NAMESPACES.OTHER_REQUESTS_MANGAGEMENT);

  const hourText = t('hour');

  const columns: ColumnDef<OverTime>[] = useMemo(
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
        key: 'overtimeDate',
        title: t('columns.overtimeDate'),
        minWidth: 140,
        render: (_, row) => <span>{toDDMMYYYY(row.overtimeDate)}</span>,
      },
      {
        key: 'startTime',
        title: t('columns.startTime'),
        minWidth: 120,
        render: (_, row) => <span>{toHHMM(row.startTime)}</span>,
      },
      {
        key: 'endTime',
        title: t('columns.endTime'),
        minWidth: 120,
        render: (_, row) => <span>{toHHMM(row.endTime)}</span>,
      },
      {
        key: 'totalHours',
        title: t('columns.totalTime'),
        minWidth: 120,
        render: (_, row) => <span>{row.totalHours ? `${row.totalHours} ${hourText}` : '-'}</span>,
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
    [hourText, t],
  );

  return { columns };
};
