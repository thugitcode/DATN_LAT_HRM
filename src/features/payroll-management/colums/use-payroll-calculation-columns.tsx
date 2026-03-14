import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import type { StaffSchedule } from '@/types';
import type { ColumnDef } from '@/components/data-table/data-table';

export const usePayrollCalculationColumns = () => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);

  const columns: ColumnDef<StaffSchedule>[] = [
    {
      key: 'stt',
      title: t('payrollCalculation.columns.stt'),
      width: 64,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      key: 'department',
      title: t('payrollCalculation.columns.department'),
      width: 140,
      // render: (_, record) => record.department,
    },
    {
      key: 'staffCode',
      title: t('payrollCalculation.columns.staff_code'),
      width: 140,
      // render: (_, record) => record.staffCode,
    },
    {
      key: 'staffName',
      title: t('payrollCalculation.columns.staff_name'),
      width: 160,
      // render: (_, record) => record.staffName,
    },
    {
      key: 'jobTitle',
      title: t('payrollCalculation.columns.job_title'),
      width: 140,
      // render: (_, record) => record.jobTitle,
    },
    {
      key: 'salaryTemplate',
      title: t('payrollCalculation.columns.salary_template'),
      width: 160,
      // render: (_, record) => record.salaryTemplate,
    },
    {
      key: 'baseSalary',
      title: t('payrollCalculation.columns.base_salary'),
      width: 130,
      // render: (_, record) => record.baseSalary.toLocaleString('vi-VN'),
    },
    {
      key: 'totalGross',
      title: t('payrollCalculation.columns.total_gross'),
      width: 130,
      // render: (_, record) => record.totalGross.toLocaleString('vi-VN'),
    },
    {
      key: 'totalPaidWorkingDays',
      title: t('payrollCalculation.columns.total_paid_working_days'),
      width: 180,
      align: 'center',
      // render: (_, record) => record.totalPaidWorkingDays,
    },
    {
      key: 'totalOvertimeHours',
      title: t('payrollCalculation.columns.total_overtime_hours'),
      width: 200,
      align: 'center',
      // render: (_, record) => record.totalOvertimeHours,
    },
    {
      key: 'kpiCompletion',
      title: t('payrollCalculation.columns.kpi_completion'),
      width: 150,
      align: 'center',
      // render: (_, record) => `${record.kpiCompletion}%`,
    },
    {
      key: 'allowance',
      title: t('payrollCalculation.columns.allowance'),
      width: 120,
      align: 'right',
      // render: (_, record) => record.allowance.toLocaleString('vi-VN'),
    },
    {
      key: 'bonus',
      title: t('payrollCalculation.columns.bonus'),
      width: 120,
      align: 'right',
      // render: (_, record) => record.bonus.toLocaleString('vi-VN'),
    },
    {
      key: 'deduction',
      title: t('payrollCalculation.columns.deduction'),
      width: 120,
      align: 'right',
      // render: (_, record) => record.deduction.toLocaleString('vi-VN'),
    },
    {
      key: 'netSalary',
      title: t('payrollCalculation.columns.net_salary'),
      width: 140,
      align: 'right',
      // render: (_, record) => record.netSalary.toLocaleString('vi-VN'),
    },
    {
      key: 'note',
      title: t('payrollCalculation.columns.note'),
      width: 160,
      // render: (_, record) => record.note ?? '--',
    },
    {
      key: 'status',
      title: t('payrollCalculation.columns.status'),
      width: 130,
      align: 'center',
      // render: (_, record) => record.status,
    },
    {
      key: 'action',
      title: t('payrollCalculation.columns.action'),
      width: 100,
      align: 'center',
      render: () => null, // gắn action button tại đây
    },
  ];

  return { columns };
};
