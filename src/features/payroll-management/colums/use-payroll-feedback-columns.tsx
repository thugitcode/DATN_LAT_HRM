import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import type { ColumnDef } from '@/components/data-table/data-table';

import type { PayslipFeedback } from '../types/payslip-feedback.type';

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
      // render: (_, row) => (
      //   <span className="text-sm text-[#11181C] whitespace-nowrap">{row.department}</span>
      // ),
    },
    {
      key: 'staffCode',
      title: t('payslipFeedback.columns.staff_code'),
      minWidth: 140,
      // render: (_, row) => (
      //   <span className="text-sm text-[#11181C] whitespace-nowrap">{row.staffCode}</span>
      // ),
    },
    {
      key: 'staffName',
      title: t('payslipFeedback.columns.staff_name'),
      minWidth: 160,
      // render: (_, row) => (
      //   <span className="text-sm text-[#11181C] whitespace-nowrap">{row.staffName}</span>
      // ),
    },
    {
      key: 'netSalary',
      title: t('payslipFeedback.columns.net_salary'),
      minWidth: 130,
      // render: (_, row) => (
      //   <span className="text-sm text-[#11181C] whitespace-nowrap">
      //     {row.netSalary.toLocaleString('vi-VN')}
      //   </span>
      // ),
    },
    {
      key: 'status',
      title: t('payslipFeedback.columns.status'),
      minWidth: 130,
      render: (_, row) => (
        <span className="text-sm text-[#11181C] whitespace-nowrap">{row.status}</span>
      ),
    },
    {
      key: 'confirmedAt',
      title: t('payslipFeedback.columns.confirmed_at'),
      minWidth: 180,
      // render: (_, row) => (
      //   <span className="text-sm text-[#11181C] whitespace-nowrap">{row.confirmedAt ?? '—'}</span>
      // ),
    },
    {
      key: 'feedback',
      title: t('payslipFeedback.columns.feedback'),
      minWidth: 160,
      // render: (_, row) => (
      //   <span className="text-sm text-[#11181C] whitespace-nowrap">{row.feedback ?? '—'}</span>
      // ),
    },
    {
      key: 'actions',
      title: t('payslipFeedback.columns.action'),
      minWidth: 100,
      hideable: false,
      render: () => null, // gắn action button tại đây
    },
  ];

  return { columns };
};
