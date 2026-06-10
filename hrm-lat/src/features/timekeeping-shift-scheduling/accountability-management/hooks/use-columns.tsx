import { NAMESPACES } from '@/i18n/constants';
import { IconPaperclip } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import type { ColumnDef } from '@/components/data-table/data-table';

import { getStaffPosition } from '../../shift-management/constants/data';
import { DepartmentRoomInfo } from '../../timekeeping-management/components/work-sheet-by-shift/department-room-info';
import { RowActions } from '../components/row-actions';
import type { AttendanceExplanation } from '../types';

export const useColumns = () => {
  const { t } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);

  const staffPosition = getStaffPosition(t);

  const columns: ColumnDef<AttendanceExplanation>[] = [
    {
      key: 'departmentName',
      title: t('columns.department'),
      minWidth: 120,
      render: (_, row) => <DepartmentRoomInfo departments={row.departments} rooms={row.rooms} />,
    },
    {
      key: 'staffCode',
      title: t('columns.employee_code'),
      minWidth: 120,
      render: (_, row) => <span className="text-sm font-mono text-gray-700">{row.staffCode}</span>,
    },
    {
      key: 'staffName',
      title: t('columns.employee_name'),
      minWidth: 130,
      render: (_, row) => (
        <span className="text-sm font-medium text-gray-800">{row.staffName}</span>
      ),
    },
    {
      key: 'position',
      title: t('explanation_management.columns.position'),
      minWidth: 80,
      render: (_, row) => <span>{staffPosition?.[row.position]}</span>,
    },
    {
      key: 'date',
      title: t('explanation_management.columns.date'),
      minWidth: 100,
      render: (_, row) => (
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {dayjs(row.date).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      key: 'typeLabel',
      title: t('explanation_management.columns.error_type'),
      minWidth: 100,
      render: (_, row) => (
        <span className="text-sm text-gray-600 whitespace-nowrap">{row.typeLabel}</span>
      ),
    },
    {
      key: 'reason',
      title: t('explanation_management.columns.explanation'),
      minWidth: 80,
      render: (_, row) => (
        <span className="text-sm text-gray-600">{row.totalWorkHours || row.reason || '—'}</span>
      ),
    },
    {
      key: 'firstAttachmentName',
      title: t('explanation_management.columns.attachment'),
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
      title: t('explanation_management.columns.manager'),
      minWidth: 130,
      render: (_, row) => (
        <span className="text-sm text-gray-700 whitespace-nowrap">
          {row.managerName || row.approvedByManagerName || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      title: t('explanation_management.columns.action'),
      minWidth: 160,
      render: (_, row) => <RowActions dataRow={row} />,
    },
  ];

  return { columns };
};
