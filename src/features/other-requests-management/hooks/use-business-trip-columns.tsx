import { useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import type { ColumnDef } from '@/components/data-table/data-table';
import { StatusChip } from '@/components/status-chip';
import { getStaffPosition } from '@/features/timekeeping-shift-scheduling/shift-management/constants/data';

import type { BusinessTrip } from '../types/business-trip.type';

export const useBusinessTripColumns = () => {
  const { t } = useTranslation(NAMESPACES.OTHER_REQUESTS_MANGAGEMENT);
  const { t: tts } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);

  const staffPosition = useMemo(() => getStaffPosition(tts), [tts]);

  const columns: ColumnDef<BusinessTrip>[] = [
    {
      key: 'department',
      title: t('columns.department'),
      minWidth: 160,
      render: (_, row) => <span>{row.department || '-'}</span>,
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
      key: 'overtimeType',
      title: t('columns.overtimeType'),
      minWidth: 160,
      render: (_, row) => <span>{row.type || '-'}</span>,
    },
    {
      key: 'overtimeDate',
      title: t('columns.overtimeDate'),
      minWidth: 140,
      render: (_, row) => <span>{row.overtimeDate || '-'}</span>,
    },
    {
      key: 'trainingDate',
      title: t('columns.trainingDate'),
      minWidth: 140,
      render: (_, row) => <span>{row.trainingDate || '-'}</span>,
    },
    {
      key: 'startTime',
      title: t('columns.startTime'),
      minWidth: 120,
      render: (_, row) => <span>{row.startTime || '-'}</span>,
    },
    {
      key: 'endTime',
      title: t('columns.endTime'),
      minWidth: 120,
      render: (_, row) => <span>{row.endTime || '-'}</span>,
    },
    {
      key: 'totalTime',
      title: t('columns.totalTime'),
      minWidth: 120,
      render: (_, row) => <span>{row.totalTime || '-'}</span>,
    },
    {
      key: 'trainingLocation',
      title: t('columns.trainingLocation'),
      minWidth: 180,
      render: (_, row) => <span>{row.trainingLocation || '-'}</span>,
    },
    {
      key: 'content',
      title: t('columns.reason'),
      minWidth: 200,
      render: (_, row) => <span>{row.content || '-'}</span>,
    },
    {
      key: 'directManager',
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
  ];

  return { columns };
};
