import { useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import { formatCurrency, formatDate } from '@/lib/utils';
import type { ColumnDef } from '@/components/data-table/data-table';

import { RowRecruitmentRequestActions } from '../components/row-recruitment-request-actions';
import type { RecruitmentRequest } from '../types/type';
import { RecruitmentRequestStatusChip } from '../components/recruitment-request-status-chip';

export const useColumns = () => {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  const columns: ColumnDef<RecruitmentRequest>[] = useMemo(
    () => [
      {
        key: 'code',
        title: t('recruitment_request.columns.code'),
        minWidth: 120,
        render: (_, row) => (
          <span className="text-sm text-[#11181C] whitespace-nowrap">{row.code}</span>
        ),
      },
      {
        key: 'departmentName',
        title: t('recruitment_request.columns.department'),
        minWidth: 200,
        render: (_, row) => (
          <div>
            <div className="text-sm text-[#11181C] whitespace-nowrap">
              {row.departmentName}
            </div>
            <div className="truncate max-w-40 text-xs text-[#A1A1AA]">
              {row.roomName}
            </div>
          </div>
        ),
      },
      {
        key: 'position',
        title: t('recruitment_request.columns.position'),
        minWidth: 120,
        render: (_, row) => (
          <span className="text-sm text-[#11181C] whitespace-nowrap">{row.position}</span>
        ),
      },
      {
        key: 'quantity',
        title: t('recruitment_request.columns.quantity'),
        minWidth: 80,
        render: (_, row) => (
          <span className="text-sm text-[#11181C] whitespace-nowrap">{row.quantity}</span>
        ),
      },
      {
        key: 'salaryRange',
        title: t('recruitment_request.columns.salary_range'),
        minWidth: 140,
        render: (_, row) => (
          <span className="text-sm text-[#11181C] whitespace-nowrap">{row.salaryFrom ? formatCurrency(row.salaryFrom) : '-'} - {row.salaryTo ? formatCurrency(row.salaryTo) : '-'}</span>
        ),
      },
      {
        key: 'requiredDate',
        title: t('recruitment_request.columns.required_date'),
        minWidth: 140,
        render: (_, row) => (
          <span className="text-sm text-[#11181C] whitespace-nowrap">
            {formatDate(row.requiredDate)}
          </span>
        ),
      },
      {
        key: 'status',
        title: t('recruitment_request.columns.status'),
        minWidth: 150,
        render: (_, row) => <RecruitmentRequestStatusChip status={row.status} />,
      },
      {
        key: 'createdByName',
        title: t('recruitment_request.columns.created_by'),
        minWidth: 140,
        render: (_, row) => (
          <span className="text-sm text-[#11181C] whitespace-nowrap">
            {row.createdByStaffName ?? '—'}
          </span>
        ),
      },
      {
        key: 'actions',
        title: t('recruitment_request.columns.actions'),
        width: 220,
        minWidth: 220,
        hideable: false,
        sticky: 'right',
        render: (_, row) => <RowRecruitmentRequestActions dataRow={row} />,
      },
    ],
    [t],
  );

  return { columns };
};
