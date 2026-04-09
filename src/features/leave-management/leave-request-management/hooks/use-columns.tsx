import { useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import { formatDate } from '@/lib/utils';
import type { ColumnDef } from '@/components/data-table/data-table';
import { getStaffPosition } from '@/features/timekeeping-shift-scheduling/shift-management/constants/data';
import { DepartmentRoomInfo } from '@/features/timekeeping-shift-scheduling/timekeeping-management/components/work-sheet-by-shift/department-room-info';

import { RowLeaveRequestActions } from '../components/row-leave-request-actions';
import type { LeaveRequest } from '../type';

export const useColumns = () => {
  const { t } = useTranslation(NAMESPACES.LEAVE_MANAGEMENT);
  const { t: tts } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);
  const staffPosition = useMemo(() => getStaffPosition(tts), [tts]);

  const columns: ColumnDef<LeaveRequest>[] = [
    {
      key: 'departments',
      title: t('leave_request.columns.department'),
      minWidth: 120,
      render: (_, row) => (
        <div className="w-50">
          <DepartmentRoomInfo departments={row.departments} rooms={row.rooms} />
        </div>
      ),
    },
    {
      key: 'staffCode',
      title: t('leave_request.columns.staff_code'),
      minWidth: 120,
      render: (_, row) => (
        <span className="text-sm text-[#11181C] whitespace-nowrap">{row.staffCode}</span>
      ),
    },
    {
      key: 'staffName',
      title: t('leave_request.columns.staff_name'),
      minWidth: 130,
      render: (_, row) => (
        <span className="text-sm text-[#11181C] whitespace-nowrap">{row.staffName}</span>
      ),
    },
    {
      key: 'staffPosition',
      title: t('leave_request.columns.position'),
      minWidth: 80,
      render: (_, row) => (
        <span className="text-sm text-[#11181C] whitespace-nowrap">
          {staffPosition?.[row?.staffPosition]}
        </span>
      ),
    },
    {
      key: 'leaveReasonName',
      title: t('leave_request.columns.leave_type'),
      minWidth: 100,
      render: (_, row) => (
        <span className="text-sm text-[#11181C] whitespace-nowrap">{row.leaveReasonName}</span>
      ),
    },
    {
      key: 'fromDate',
      title: t('leave_request.columns.from_date'),
      minWidth: 100,
      render: (_, row) => (
        <div className="text-sm text-[#11181C] whitespace-nowrap flex flex-row items-center gap-1">
          {!!row?.startTime && <span>{row.startTime?.slice(0, 5)}</span>}
          <span>{formatDate(row.fromDate)}</span>
        </div>
      ),
    },
    {
      key: 'toDate',
      title: t('leave_request.columns.to_date'),
      minWidth: 100,
      render: (_, row) => (
        <div className="text-sm text-[#11181C] whitespace-nowrap flex flex-row items-center gap-1">
          {!!row?.startTime && <span>{row.endTime?.slice(0, 5)}</span>}
          <span>{formatDate(row.toDate)}</span>
        </div>
      ),
    },
    {
      key: 'totalDays',
      title: t('leave_request.columns.total_days'),
      minWidth: 100,
      render: (_, row) => {
        const days = Number(row.totalDays);
        const display = days % 1 === 0 ? Math.floor(days) : days;
        return (
          <span className="text-sm text-[#11181C] whitespace-nowrap">
            {t('leave_request.columns.days_count', { count: display })}
          </span>
        );
      },
    },
    {
      key: 'reason',
      title: t('leave_request.columns.reason'),
      minWidth: 100,
      render: (_, row) => (
        <span className="text-sm text-[#11181C] whitespace-nowrap">{row.reason}</span>
      ),
    },
    {
      key: 'replacementStaffName',
      title: t('leave_request.columns.replacement'),
      minWidth: 100,
      render: (_, row) => (
        <span className="text-sm text-[#11181C] whitespace-nowrap">{row.replacementStaffName}</span>
      ),
    },
    {
      key: 'approvedByName',
      title: t('leave_request.columns.approved_by'),
      minWidth: 100,
      render: (_, row) => (
        <span className="text-sm text-[#11181C] whitespace-nowrap">
          {row.approvedByName ?? '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '',
      sticky: "right",
      minWidth: 160,
      hideable: false,
      render: (_, row) => <RowLeaveRequestActions dataRow={row} />,
    },
  ];
  return { columns };
};
