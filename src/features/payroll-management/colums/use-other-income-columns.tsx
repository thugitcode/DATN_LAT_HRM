import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import type { ColumnDef } from '@/components/data-table/data-table';

import type { OtherIncome } from '../types/other-income.type';

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
      // render: (_, record) => {
      //   return (
      //     <div className="w-50">
      //       <DepartmentRoomInfo departments={record.departments} rooms={record.rooms} />
      //     </div>
      //   );
      // },
    },
    {
      key: 'staffCode',
      title: t('columns.staff_code'),
      // render: (_, record) => record.staff.code,
    },
    {
      key: 'staffName',
      title: t('columns.staff_name'),
      // render: (_, record) => (
      //   <div className="">
      //     <p className="text-sm font-medium text-gray-800">{record.staff.name}</p>
      //   </div>
      // ),
    },
    {
      key: 'type',
      title: t('columns.type'),
      // render: (_, record) => record.type,
    },
    {
      key: 'description',
      title: t('columns.description'),
      // render: (_, record) => record.description,
    },
    {
      key: 'source',
      title: t('columns.source'),
      // render: (_, record) => record.source,
    },
    {
      key: 'amount',
      title: t('columns.amount'),
      // render: (_, record) => record.amount,
    },
    {
      key: 'inputBy',
      title: t('columns.input_by'),
      // render: (_, record) => record.inputBy,
    },
    {
      key: 'actions',
      title: t('columns.actions'),
      width: 120,
      align: 'center',
    },
  ];

  return { columns };
};
