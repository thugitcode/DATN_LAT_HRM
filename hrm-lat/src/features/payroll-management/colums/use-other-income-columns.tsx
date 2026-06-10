import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import { formatVND } from '@/lib/helpers';
import type { ColumnDef } from '@/components/data-table/data-table';
import { DepartmentRoomInfo } from '@/features/timekeeping-shift-scheduling/timekeeping-management/components/work-sheet-by-shift/department-room-info';

import { RowOtherIncomeActions } from '../components/row-other-income-actions';
import { KPI_SOURCE_LABEL } from '../constants/kpi';
import { OTHER_INCOME_TYPE_LABEL } from '../constants/other-income';
import type { OtherIncome } from '../types/other-income.type';
import { formatDate } from '@/lib/utils';

export const useOtherIncomeColumns = () => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);

  const columns: ColumnDef<OtherIncome>[] = [
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
      render: (_, record) => (
        <div className="w-50">
          <DepartmentRoomInfo departments={record.departments} rooms={record.rooms} />
        </div>
      ),
    },
    {
      key: 'staffCode',
      title: t('columns.staff_code'),
      render: (_, record) => record.staff?.code || '-',
    },
    {
      key: 'staffName',
      title: t('columns.staff_name'),
      sticky: 'left',
      render: (_, record) => record.staff?.name || '-',
    },
    {
      key: 'type',
      title: t('columns.type'),
      render: (_, record) => OTHER_INCOME_TYPE_LABEL?.[record.type] || '-',
    },
    {
      key: 'description',
      title: t('columns.description'),
      render: (_, record) => record.description || '-',
    },
    {
      key: 'source',
      title: t('columns.source'),
      render: (_, record) => KPI_SOURCE_LABEL?.[record.source],
    },
    {
      key: 'amount',
      title: t('columns.amount'),
      render: (_, record) => formatVND(record.amount),
    },
    {
      key: 'inputBy',
      title: t('columns.input_by'),
      render: (_, record) => (
        <>
          <span className="text-[#11181C] text-sm">{record.entryPerson?.name}</span>
          <br />
          <span className="text-[#52525B] text-sm">{formatDate(record?.createdAt)}</span>
        </>
      )
    },
    {
      key: 'actions',
      title: t('revenue.columns.actions'),
      width: 100,
      align: 'center',
      sticky: 'right',

      render: (_, record) => <RowOtherIncomeActions dataRow={record} />,
    },
  ];

  return { columns };
};
