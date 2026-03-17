import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import type { ColumnDef } from '@/components/data-table/data-table';
import { StatusChip } from '@/components/status-chip';
import { DepartmentRoomInfo } from '@/features/timekeeping-shift-scheduling/timekeeping-management/components/work-sheet-by-shift/department-room-info';

import { KpiRating } from '../components/kpi-rating';
import { KpiScore } from '../components/kpi-score';
import { RowKpiActions } from '../components/row-kpi-actions';
import { KPI_SOURCE_LABEL } from '../constants/kpi';
import type { Kpi } from '../types/kpi.type';

export const useKpiColumns = () => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);

  const columns: ColumnDef<Kpi>[] = [
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
            <DepartmentRoomInfo departments={record.departments} rooms={record.rooms} />
          </div>
        );
      },
    },
    {
      key: 'staffCode',
      title: t('columns.staff_code'),
      render: (_, record) => record.staff.code,
    },
    {
      key: 'staffName',
      title: t('columns.staff_name'),
      render: (_, record) => (
        <div className="">
          <p className="text-sm font-medium text-gray-800">{record.staff.name}</p>
        </div>
      ),
    },
    {
      key: 'kpiScore',
      title: t('columns.kpi_score'),
      width: 120,
      align: 'center',
      render: (_, record) => <KpiScore score={record.kpiScore} rating={record?.rating} />,
    },
    {
      key: 'rating',
      title: t('columns.ranking'),
      align: 'center',
      render: (_, record) => <KpiRating rating={record?.rating} />,
    },
    {
      key: 'evaluator',
      title: t('columns.evaluator'),
      render: (_, record) => <>{record?.evaluator?.name}</>,
    },
    {
      key: 'source',
      title: t('columns.source'),
      width: 120,
      align: 'center',
      render: (_, record) => <>{KPI_SOURCE_LABEL?.[record?.source]}</>,
    },
    {
      key: 'status',
      title: t('columns.status'),
      width: 140,
      align: 'center',
      render: (_, record) => <StatusChip status={record?.status} />,
    },
    {
      key: 'actions',
      title: t('columns.actions'),
      width: 120,
      align: 'center',
      render: (_, record) => <RowKpiActions dataRow={record} />,
    },
  ];

  return { columns };
};
