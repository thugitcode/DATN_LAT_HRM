import { useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import { toDDMMYYYY, toHHMM } from '@/lib/utils';
import type { ColumnDef } from '@/components/data-table/data-table';
import { StatusChip } from '@/components/status-chip';
import { getStaffPosition } from '@/features/timekeeping-shift-scheduling/shift-management/constants/data';
import { DepartmentRoomInfo } from '@/features/timekeeping-shift-scheduling/timekeeping-management/components/work-sheet-by-shift/department-room-info';

import { RequestAttendanceTypeLabel } from '../constants/constants';
import type { GeneralRequest } from '../types/generate-request.type';

export const useBusinessTripColumns = () => {
  const { t } = useTranslation(NAMESPACES.OTHER_REQUESTS_MANGAGEMENT);
  const { t: tts } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);

  const staffPosition = useMemo(() => getStaffPosition(tts), [tts]);

  const columns: ColumnDef<GeneralRequest>[] = [
    {
      key: 'department',
      title: t('columns.department'),
      minWidth: 160,
      render: (_, row) => <DepartmentRoomInfo departments={row?.departments} rooms={row?.rooms} />,
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
      sticky: 'left',
      render: (_, row) => <span>{row.staffName || '-'}</span>,
    },
    {
      key: 'requestType',
      title: t('columns.businessTripType'),
      minWidth: 160,
      render: (_, row) => <span>{RequestAttendanceTypeLabel?.[row?.requestType] || '-'}</span>,
    },
    // {
    //   key: 'fromDate',
    //   title: t('columns.overtimeDate'),
    //   minWidth: 140,
    //   render: (_, row) => <span>{row.fromDate ? toDDMMYYYY(row.fromDate) : '-'}</span>,
    // },
    // {
    //   key: 'toDate',
    //   title: t('columns.trainingDate'),
    //   minWidth: 140,
    //   render: (_, row) => <span>{row.toDate ? toDDMMYYYY(row.toDate) : '-'}</span>,
    // },
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
      render: (_, row) => <span>{row.totalHours || '-'}</span>,
    },
    {
      key: 'location',
      title: t('columns.businessTripLocation'),
      minWidth: 180,
      render: (_, row) => <span>{row.location || '-'}</span>,
    },
    {
      key: 'reason',
      title: t('columns.reason'),
      minWidth: 200,
      render: (_, row) => <span>{row.reason || '-'}</span>,
    },
    {
      key: 'directManager',
      title: t('columns.directManager'),
      minWidth: 180,
      render: (_, row) => <span>{row.managerNames?.join(', ') || '-'}</span>,
    },
    {
      key: 'status',
      title: t('columns.status'),
      // sticky: 'right',
      minWidth: 120,
      render: (_, row) => <StatusChip status={row?.status} />,
    },
  ];

  return { columns };
};
