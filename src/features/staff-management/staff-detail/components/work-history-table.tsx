import { useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { IconHistory } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { DataTable } from '@/components/data-table/data-table';
import { useStaffContracts } from '@/query-options/staff-contract';

import { useWorkHistoryColumns, type WorkHistoryRow } from '../hooks/use-work-history-columns';
import { icons } from '@/lib/icons';

interface WorkHistoryTableProps {
  staffId: string;
}

export const WorkHistoryTable = ({ staffId }: WorkHistoryTableProps) => {
  const { t, i18n } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
  const { data: response } = useStaffContracts(staffId);
  const contracts = response?.data || [];

  const { columns } = useWorkHistoryColumns(staffId);

  const dataSource = useMemo<WorkHistoryRow[]>(
    () =>
      contracts
        .flatMap((c) =>
          (c.staffWorkHistory || []).map((wh) => ({
            ...wh,
            _contractId: c.id,
            _staffCode: c.staff?.code,
            _staffName: c.staff?.name,
            _departmentName: c.department?.name,
            departments: c.departments,
            rooms: c.rooms,
          })),
        )
        .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()),
    [contracts, i18n.language],
  );
  return (
    <div className="bg-white rounded-xl shadow-2xl">
      <div className="flex items-center gap-2 px-6 pt-3 pb-0 text-[#11181C] fill-black">
        {icons.alarm}
        <h3 className="text-[16px] font-bold text-[#11181C]">{t('work_history.title')}</h3>
      </div>

      <DataTable
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        selectionMode="none"
        emptyContent={t('work_history.empty')}
      />
    </div>
  );
};
