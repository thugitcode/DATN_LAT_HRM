import { formatDate } from '@/lib/utils';
import type { ColumnDef } from '@/components/data-table/data-table';
import { STAFF_POSITION } from '@/features/timekeeping-shift-scheduling/shift-management/constants/data';
import { DepartmentRoomInfo } from '@/features/timekeeping-shift-scheduling/timekeeping-management/components/work-sheet-by-shift/department-room-info';

import { RowLeaveRequestActions } from '../components/row-leave-request-actions';
import type { LeaveRequest } from '../type';

export const useColumns = () => {
  const columns: ColumnDef<LeaveRequest>[] = [
    {
      key: 'departments',
      title: 'Khoa/phòng',
      minWidth: 120,
      render: (_, row) => (
        <div className="w-50">
          <DepartmentRoomInfo departments={row.departments} rooms={row.rooms} />
        </div>
      ),
    },
    {
      key: 'staffCode',
      title: 'Mã nhân viên',
      minWidth: 120,
      render: (_, row) => (
        <span className="text-sm text-[#11181C] whitespace-nowrap">{row.staffCode}</span>
      ),
    },
    {
      key: 'staffName',
      title: 'Tên nhân viên',
      minWidth: 130,
      render: (_, row) => (
        <span className="text-sm text-[#11181C] whitespace-nowrap">{row.staffName}</span>
      ),
    },
    {
      key: 'staffPosition',
      title: 'Chức vụ',
      minWidth: 80,

      render: (_, row) => (
        <span className="text-sm text-[#11181C] whitespace-nowrap">
          {STAFF_POSITION?.[row.staffPosition]}
        </span>
      ),
    },
    {
      key: 'leaveReasonName',
      title: 'Loại nghỉ',
      minWidth: 100,
      render: (_, row) => (
        <span className="text-sm text-[#11181C] whitespace-nowrap">{row.leaveReasonName}</span>
      ),
    },
    {
      key: 'fromDate',
      title: 'Thời gian bắt đầu',
      minWidth: 100,
      render: (_, row) => (
        <span className="text-sm text-[#11181C] whitespace-nowrap">{formatDate(row.fromDate)}</span>
      ),
    },
    {
      key: 'toDate',
      title: 'Thời gian kết thúc',
      minWidth: 100,
      render: (_, row) => (
        <span className="text-sm text-[#11181C] whitespace-nowrap">{formatDate(row.toDate)}</span>
      ),
    },
    {
      key: 'totalDays',
      title: 'Tổng thời gian nghỉ',
      minWidth: 100,
      render: (_, row) => {
        const days = Number(row.totalDays);
        const display = days % 1 === 0 ? Math.floor(days) : days;
        return <span className="text-sm text-[#11181C] whitespace-nowrap">{display} ngày</span>;
      },
    },
    {
      key: 'reason',
      title: 'Lý do nghỉ',
      minWidth: 100,
      render: (_, row) => (
        <span className="text-sm text-[#11181C] whitespace-nowrap">{row.reason}</span>
      ),
    },
    {
      key: 'replacementStaffName',
      title: 'Người thay thế',
      minWidth: 100,
      render: (_, row) => (
        <span className="text-sm text-[#11181C] whitespace-nowrap">{row.replacementStaffName}</span>
      ),
    },
    {
      key: 'approvedByName',
      title: 'Quản lý duyệt',
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
      minWidth: 160,
      hideable: false,
      render: (_, row) => <RowLeaveRequestActions dataRow={row} />,
    },
  ];
  return { columns };
};
