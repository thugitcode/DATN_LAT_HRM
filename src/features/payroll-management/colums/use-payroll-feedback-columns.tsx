import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import type { ColumnDef } from '@/components/data-table/data-table';

import { RowPayslipActions } from '../components/row-payslip-feedback-actions';
import type { PayslipFeedback, PayslipFeedbackStatus } from '../types/payslip-feedback.type';
import { StatusChip, type StatusConfig } from '@/components/status-chip';

const StatusConfig: Record<PayslipFeedbackStatus, StatusConfig> = {
  CONFIRMED: {
    color: 'success',
    icon: 'checkedDone',
    i18nKey: 'status.confirmed',
  },
  REJECTED: {
    color: 'danger',
    icon: 'cancel',
    i18nKey: 'status.rejected',
  },
  PENDING: {
    color: 'warning',
    icon: 'peinding',
    i18nKey: 'status.pendingFeedback',
  },
};

export const usePayrollFeedbackColumns = () => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);

  const columns: ColumnDef<PayslipFeedback>[] = [
    {
      key: 'stt',
      title: t('payslipFeedback.columns.stt'),
      minWidth: 64,
      render: (_, __, index) => (
        <span className="text-sm text-[#11181C] whitespace-nowrap">{index + 1}</span>
      ),
    },
    {
      key: 'department',
      title: t('payslipFeedback.columns.department'),
      minWidth: 140,
    },
    {
      key: 'code',
      title: t('payslipFeedback.columns.staff_code'),
      minWidth: 140,
      render: (_, row) => (
        <span className="text-sm text-[#11181C] whitespace-nowrap">{row.staff?.code ?? '—'}</span>
      ),
    },
    {
      key: 'name',
      title: t('payslipFeedback.columns.staff_name'),
      minWidth: 160,
      render: (_, row) => (
        <span className="text-sm text-[#11181C] whitespace-nowrap">{row.staff?.name ?? '—'}</span>
      ),
    },
    {
      key: 'payrollResult',
      title: t('payslipFeedback.columns.net_salary'),
      minWidth: 130,
      render: (_, row) => (
        <span className="text-sm text-[#11181C] whitespace-nowrap">
          {row.payrollResult?.netPay
            ? Number(row.payrollResult.netPay).toLocaleString('vi-VN') + ' đ'
            : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      title: t('payslipFeedback.columns.status'),
      minWidth: 130,
      render: (_, row) => (
        <span className="text-sm text-[#11181C] whitespace-nowrap">
          <StatusChip status={row.status} statusConfig={StatusConfig} />
        </span>
      ),
    },
    {
      key: 'resolvedAt',
      title: t('payslipFeedback.columns.confirmed_at'),
      minWidth: 180,
      render: (_, row) => (
        <span className="text-sm text-[#11181C] whitespace-nowrap">
          {row.resolvedAt
            ? new Date(row.resolvedAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
            : '—'}
        </span>
      ),
    },
    {
      key: 'content',
      title: t('payslipFeedback.columns.feedback'),
      minWidth: 160,
      render: (_, row) => <span className="text-sm text-[#11181C] w-20">{row.content ?? '—'}</span>,
    },
    {
      key: 'actions',
      title: t('payslipFeedback.columns.action'),
      minWidth: 100,
      hideable: false,
      render: (_, row) => <RowPayslipActions dataRow={row} />,
    },
  ];

  return { columns };
};
