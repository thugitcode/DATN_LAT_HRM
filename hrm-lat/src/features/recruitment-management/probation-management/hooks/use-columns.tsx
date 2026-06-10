import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@heroui/react';

import { NAMESPACES } from '@/i18n/constants';
import { formatDate } from '@/lib/utils';
import type { ColumnDef } from '@/components/data-table/data-table';

import { ProbationStatusChip } from '../components/probation-status-chip';
import { RowProbationActions } from '../components/row-probation-actions';
import type { ProbationItem } from '../types/probation.type';

export const useProbationColumns = () => {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  const columns: ColumnDef<ProbationItem>[] = useMemo(
    () => [
      {
        key: 'name',
        title: t('probation.columns.employee'),
        minWidth: 200,
        render: (_, row) => (
          <div className="flex items-center gap-2">
            <Avatar
              name={row.name}
              size="sm"
              className="shrink-0"
            />
            <div>
              <div className="text-sm text-[#11181C] font-medium whitespace-nowrap">{row.name}</div>
              <div className="text-xs text-[#A1A1AA]">{row.code}</div>
            </div>
          </div>
        ),
      },
      {
        key: 'jobTitle',
        title: t('probation.columns.position'),
        minWidth: 140,
        render: (_, row) => (
          <span className="text-sm text-[#11181C] whitespace-nowrap">
            {row.jobTitle?.name ?? '—'}
          </span>
        ),
      },
      {
        key: 'department',
        title: t('probation.columns.department'),
        minWidth: 160,
        render: (_, row) => (
          <div>
            <div className="text-sm text-[#11181C] whitespace-nowrap">
              {row.department?.name ?? '—'}
            </div>
            {row.room && (
              <div className="text-xs text-[#A1A1AA] truncate max-w-40">
                {row.room.name}
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'probationStartDate',
        title: t('probation.columns.start_date'),
        minWidth: 130,
        render: (_, row) => (
          <span className="text-sm text-[#11181C] whitespace-nowrap">
            {formatDate(row.probationStartDate)}
          </span>
        ),
      },
      {
        key: 'probationEndDate',
        title: t('probation.columns.end_date'),
        minWidth: 130,
        render: (_, row) => (
          <span className="text-sm text-[#11181C] whitespace-nowrap">
            {formatDate(row.probationEndDate)}
          </span>
        ),
      },
      {
        key: 'evaluator',
        title: t('probation.columns.evaluator'),
        minWidth: 140,
        render: (_, row) => (
          <span className="text-sm text-[#11181C] whitespace-nowrap">
            {row.evaluator?.name ?? '—'}
          </span>
        ),
      },
      {
        key: 'displayProbationStatus',
        title: t('probation.columns.result'),
        minWidth: 160,
        render: (_, row) => <ProbationStatusChip status={row.displayProbationStatus} />,
      },
      {
        key: 'probationProposal',
        title: t('probation.columns.proposal'),
        minWidth: 160,
        render: (_, row) => (
          <span className="text-sm text-[#11181C] whitespace-nowrap">
            {row.probationProposal ?? '—'}
          </span>
        ),
      },
      {
        key: 'actions',
        title: t('probation.columns.actions'),
        minWidth: 200,
        hideable: false,
        sticky: 'right',
        render: (_, row) => <RowProbationActions dataRow={row} />,
      },
    ],
    [t],
  );

  return { columns };
};
