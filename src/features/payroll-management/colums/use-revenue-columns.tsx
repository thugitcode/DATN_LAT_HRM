import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import type { ColumnDef } from '@/components/data-table/data-table';
import { DepartmentRoomInfo } from '@/features/timekeeping-shift-scheduling/timekeeping-management/components/work-sheet-by-shift/department-room-info';

import { RowRevenueActions } from '../components/revenue/row-revenue-actions';
import { KPI_SOURCE_LABEL } from '../constants/kpi';
import type { KpiSourceEnum } from '../types/kpi.type';
import type { RevenueDataListType } from '../types/revenue.type';
import { StatusChip } from '@/components/status-chip';
import type { Status } from '@/types/global.type';

// import { RowRevenueActions } from '../components/row-attendance-actions';

export const useRevenueDataColumns = () => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const columns: ColumnDef<RevenueDataListType>[] = [
    {
      key: 'stt',
      title: t('revenue.columns.stt'),
      width: 64,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      key: 'department',
      title: t('revenue.columns.department'),
      width: 180,
      render: (_, record) => (
        <div className="w-full">
          {/* Giữ nguyên component cũ của bạn, lưu ý check null staff.departments */}
          <DepartmentRoomInfo departments={record?.departments || []} rooms={record?.rooms || []} />
        </div>
      ),
    },
    {
      key: 'staffCode',
      title: t('revenue.columns.staff_code'),
      width: 140,
      render: (_, record) => record.staff?.code,
    },
    {
      key: 'staffName',
      title: t('revenue.columns.staff_name'),
      sticky: 'left',
      width: 180,
      render: (_, record) => record.staff?.name,
      // render: (_, record) => (
      //   <div>
      //     <p className="text-sm font-medium text-gray-800">{record.staff?.name}</p>
      //     {record.staff?.position && (
      //       <p className="text-xs text-[#A1A1AA]">{tc(`options.staff_position.${record.staff.position as StaffPosition}`)}</p>
      //     )}
      //   </div>
      // ),
    },
    {
      key: 'targetAmount',
      title: t('revenue.columns.target_amount'),
      width: 140,
      align: 'end',
      render: (_, record) => record.targetAmount?.toLocaleString(),
    },
    {
      key: 'actualAmount',
      title: t('revenue.columns.actual_amount'),
      width: 140,
      align: 'end',
      render: (_, record) => <span>{record.actualAmount?.toLocaleString()}</span>,
    },
    {
      key: 'achievementRate',
      title: t('revenue.columns.achievement_rate'),
      width: 110,
      align: 'center',
      render: (_, record) => (
        <span className={cn(record.achievementRate > 100 ? 'text-success' : 'text-danger')}>
          {record.achievementRate}%
        </span>
      ),
    },
    {
      key: 'source',
      title: t('revenue.columns.data_source'),
      width: 130,
      align: 'center',
      render: (_, record) => <>{KPI_SOURCE_LABEL?.[record?.source as KpiSourceEnum]}</>,
    },
    {
      key: 'status',
      title: t('revenue.columns.status'),
      width: 120,
      align: 'center',
      render: (_, record) => <StatusChip status={record.status as Status} />,
    },
    {
      key: 'actions',
      title: t('revenue.columns.actions'),
      width: 100,
      align: 'center',
      sticky: 'right',
      render: (_, record) => <RowRevenueActions dataRow={record} />,
    },
  ];

  return { columns };
};
