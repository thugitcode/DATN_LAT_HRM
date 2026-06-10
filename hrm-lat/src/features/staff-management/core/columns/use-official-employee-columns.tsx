import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import type { Staff } from '@/types/staff.type';
import type { ColumnDef } from '@/components/data-table/data-table';

import { RowOfficialEmployeeActions } from '../components/row-official-employee-actions';
import { useBaseColumnsStaffManagement } from './use-base-columns-staff-management';

export const useOfficialEmployeeColumns = () => {
  const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);

  const { columns: baseColumns } = useBaseColumnsStaffManagement();

  const columns: ColumnDef<Staff>[] = [
    ...baseColumns,
    {
      key: 'actions',
      title: t('staff_table.columns.actions'),
      render: (_, record) => <RowOfficialEmployeeActions dataRow={record} />,
    },
  ];

  return { columns };
};
