import { IconPaperclip } from '@tabler/icons-react';
import dayjs from 'dayjs';

import type { ColumnDef } from '@/components/data-table/data-table';

import { STAFF_POSITION } from '../../shift-management/constants/data';
import { RowActions } from '../components/row-actions';
import type { AttendanceExplanation } from '../types';
import { DepartmentRoomInfo } from '../../timekeeping-management/components/work-sheet-by-shift/department-room-info';

export const useColumns = () => {
  const columns: ColumnDef<AttendanceExplanation>[] = [
    {
      key: 'departmentName',
      title: 'KHOA/PHÒNG',
      minWidth: 120,
      render: (_, row) => (
        <DepartmentRoomInfo departments={row.departments} rooms={row.rooms} />
      ),
    },
    {
      key: 'staffCode',
      title: 'MÃ NHÂN VIÊN',
      minWidth: 120,
      render: (_, row) => <span className="text-sm font-mono text-gray-700">{row.staffCode}</span>,
    },
    {
      key: 'staffName',
      title: 'TÊN NHÂN VIÊN',
      minWidth: 130,
      render: (_, row) => (
        <span className="text-sm font-medium text-gray-800">{row.staffName}</span>
      ),
    },
    {
      key: 'position',
      title: 'CHỨC VỤ',
      minWidth: 80,

      render: (_, row) => <span>{STAFF_POSITION?.[row.position]}</span>,
    },
    {
      key: 'date',
      title: 'NGÀY',
      minWidth: 100,
      render: (_, row) => (
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {dayjs(row.date).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      key: 'typeLabel',
      title: 'LOẠI LỖI',
      minWidth: 100,

      render: (_, row) => (
        <span className="text-sm text-gray-600 whitespace-nowrap">{row.typeLabel}</span>
      ),
    },
    {
      key: 'reason',
      title: 'GIẢI TRÌNH',
      minWidth: 80,
      render: (_, row) => (
        <span className="text-sm text-gray-600">{row.totalWorkHours || row.reason || '—'}</span>
      ),
    },
    {
      key: 'firstAttachmentName',
      title: 'FILE ĐÍNH KÈM',
      minWidth: 140,
      render: (_, row) =>
        row.attachmentCount > 0 ? (
          <span className="flex items-center gap-1.5 text-blue-500">
            <IconPaperclip size={13} />
            <span className="text-sm truncate max-w-27.5">
              {row.firstAttachmentName || 'Tên file.pdf'}
            </span>
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: 'managerName',
      title: 'QUẢN LÝ QUYẾT',
      minWidth: 130,
      render: (_, row) => (
        <span className="text-sm text-gray-700 whitespace-nowrap">
          {row.managerName || row.approvedByManagerName || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'HÀNH ĐỘNG',
      minWidth: 160,
      render: (_, row) => <RowActions dataRow={row} />,
    },
  ];
  return { columns };
};
