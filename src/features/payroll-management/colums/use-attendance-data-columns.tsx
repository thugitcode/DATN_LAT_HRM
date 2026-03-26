import { useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import type { ColumnDef } from '@/components/data-table/data-table';
import { getStaffPosition } from '@/features/timekeeping-shift-scheduling/shift-management/constants/data';
import { DepartmentRoomInfo } from '@/features/timekeeping-shift-scheduling/timekeeping-management/components/work-sheet-by-shift/department-room-info';
import type { WorkSheetByShiftType } from '@/features/timekeeping-shift-scheduling/timekeeping-management/types/timekeeping-management.type';

import { RowAttendanceActions } from '../components/row-attendance-actions';

export const useAttendanceDataColumns = () => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const { t: tk } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);
  const staffPosition = useMemo(() => getStaffPosition(tk), [tk]);

  const columns: ColumnDef<WorkSheetByShiftType>[] = [
    {
      key: 'stt',
      title: t('columns.stt'),
      width: 64,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      key: 'department',
      title: t('columns.department'),
      width: 140,
      render: (_, record) => {
        return (
          <div className="w-50">
            <DepartmentRoomInfo departments={record.staff.departments} rooms={record.staff.rooms} />
          </div>
        );
      },
    },
    {
      key: 'staffCode',
      title: t('columns.staff_code'),
      width: 140,
      render: (_, record) => record.staff.code,
    },
    {
      key: 'staffName',
      title: t('columns.staff_name'),
      width: 160,
      sticky: 'left',
      render: (_, record) => (
        <div className="w-50">
          <p className="text-sm font-medium text-gray-800 ">{record.staff.name}</p>
          <p className="text-xs text-[#A1A1AA]">{staffPosition?.[record.staff.position]}</p>
        </div>
      ),
    },
    {
      key: 'totalWorkDays',
      title: t('columns.total_work_days'),
      width: 120,
      align: 'center',
      render: (_, record) => record.summary.totalWork,
    },
    {
      key: 'paidLeave',
      title: t('columns.paid_leave'),
      width: 120,
      align: 'center',
      render: (_, record) => record.summary.paidLeave,
    },
    {
      key: 'unpaidLeave',
      title: t('columns.unpaid_leave'),
      width: 150,
      align: 'center',
      render: (_, record) => record.summary.unpaidLeave,
    },
    {
      key: 'onDuty',
      title: t('columns.on_duty'),
      width: 120,
      align: 'center',
      render: (_, record) => record.summary.onCall,
    },
    {
      key: 'compensatoryLeave',
      title: t('columns.compensatory_leave'),
      width: 140,
      align: 'center',
      render: (_, record) => record.summary.compLeave,
    },
    {
      key: 'holidayLeave',
      title: t('columns.holiday_leave'),
      width: 120,
      align: 'center',
      render: (_, record) => record.summary.holiday,
    },
    {
      key: 'otherLeave',
      title: t('columns.other_leave'),
      width: 120,
      align: 'center',
      render: (_, record) => record.summary.otherLeave,
    },
    {
      key: 'overtime',
      title: t('columns.overtime'),
      width: 110,
      align: 'center',
      render: (_, record) => record.summary.overtimeHours,
    },
    {
      key: 'compensatoryHours',
      title: t('columns.compensatory_hours'),
      width: 110,
      align: 'center',
      render: (_, record) => record.summary.compHours,
    },
    {
      key: 'violation',
      title: t('columns.violation'),
      width: 120,
      align: 'center',
      render: (_, record) => {
        const violationCount = record.summary.violationCount;
        return (
          <span className={cn(!!violationCount && 'text-[#F31260]')}>
            {record.summary.violationCount}
          </span>
        );
      },
    },
    {
      key: 'actions',
      title: 'Hành động',
      width: 120,
      align: 'center',
      sticky: 'right',
      render: (_, record) => <RowAttendanceActions dataRow={record?.staff} />,
    },
  ];

  return { columns };
};
