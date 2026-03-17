import { useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import { toDDMMYYYY, toHHMM } from '@/lib/utils';
import type { ColumnDef } from '@/components/data-table/data-table';
import { StatusChip } from '@/components/status-chip';
import { DepartmentRoomInfo } from '@/features/timekeeping-shift-scheduling/timekeeping-management/components/work-sheet-by-shift/department-room-info';

import type { GeneralRequest } from '../types/generate-request.type';

export const useOvertimeColumns = () => {
  const { t } = useTranslation(NAMESPACES.OTHER_REQUESTS_MANGAGEMENT);

  const hourText = t('hour');

  const columns: ColumnDef<GeneralRequest>[] = useMemo(
    () => [
      {
        key: 'department',
        title: t('columns.department'),
        minWidth: 140,
        render: (_, row) => (
          <DepartmentRoomInfo departments={row?.departments} rooms={row?.rooms} />
        ),
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
        render: (_, row) => <span>{row.fromDate ? toDDMMYYYY(row.fromDate) : '-'}</span>,
      },
      {
        key: 'startTime',
        title: t('columns.startTime'),
        minWidth: 120,
        render: (_, row) => <span>{row.startTime ? toHHMM(row.startTime) : '-'}</span>,
      },
      {
        key: 'endTime',
        title: t('columns.endTime'),
        minWidth: 120,
        render: (_, row) => <span>{row.endTime ? toHHMM(row.endTime) : '-'}</span>,
      },
      {
        key: 'totalHours',
        title: t('columns.totalTime'),
        minWidth: 120,
        render: (_, row) => (
          <span>{row.totalHours ? `${Number(row.totalHours)?.toFixed()} ${hourText}` : '-'}</span>
        ),
      },
      {
        key: 'reason',
        title: t('columns.reason'),
        minWidth: 200,
        render: (_, row) => <span>{row.reason || '-'}</span>,
      },
      {
        key: 'managerNames',
        title: t('columns.directManager'),
        minWidth: 180,
        render: (_, row) => <span>{row.managerNames?.join(', ') || '-'}</span>,
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
