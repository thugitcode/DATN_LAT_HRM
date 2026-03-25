import { useNavigate } from '@tanstack/react-router';
import { NAMESPACES } from '@/i18n/constants';
import { Button, Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { formatCurrency } from '@/lib/utils';
import type { ColumnDef } from '@/components/data-table/data-table';
import { DepartmentRoomInfo } from '@/features/timekeeping-shift-scheduling/timekeeping-management/components/work-sheet-by-shift/department-room-info';

import type { StaffPayroll } from '../types/payroll-caculation.type';

export const usePayrollCalculationColumns = () => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);
  const navigate = useNavigate();

  const columns: ColumnDef<StaffPayroll>[] = [
    {
      key: 'stt',
      title: t('payrollCalculation.columns.stt'),
      width: 64,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      key: 'departmentName', // Map từ departmentName
      title: t('payrollCalculation.columns.department'),
      width: 140,
      render: (_, record) => (
        <DepartmentRoomInfo departments={record.departments} rooms={record.rooms} />
      ),
    },
    {
      key: 'staffCode', // Giữ nguyên staffCode
      title: t('payrollCalculation.columns.staff_code'),
      width: 140,
      render: (_, record) => record.staffCode,
    },
    {
      key: 'staffName', // Giữ nguyên staffName
      title: t('payrollCalculation.columns.staff_name'),
      width: 160,
      render: (_, record) => record.staffName,
    },
    {
      key: 'position', // Map từ position thay cho jobTitle
      title: t('payrollCalculation.columns.job_title'),
      width: 140,
      render: (_, record) => tc(`options.staff_position.${record.position}` as any),
    },
    {
      key: 'confirmationStatus', // Map từ confirmationStatus thay cho salaryTemplate
      title: t('payrollCalculation.columns.salary_template'),
      width: 160,
      render: (_, record) => record.confirmationStatus,
    },
    {
      key: 'basicSalary', // Map từ basicSalary
      title: t('payrollCalculation.columns.base_salary'),
      width: 130,
      align: 'end',
      render: (_, record) => record.basicSalary?.toLocaleString('vi-VN'),
    },
    {
      key: 'totalGross', // Dùng netPay để hiển thị (hoặc tính toán nếu cần totalGross)
      title: t('payrollCalculation.columns.total_gross'),
      width: 130,
      align: 'end',
      render: (_, record) => formatCurrency(record.totalGross),
    },
    {
      key: 'actualWorkDays', // Map từ actualWorkDays
      title: t('payrollCalculation.columns.total_paid_working_days'),
      width: 180,
      align: 'center',
      render: (_, record) => record.actualWorkDays,
    },
    {
      key: 'overtimeHours', // Map từ overtimeHours
      title: t('payrollCalculation.columns.total_overtime_hours'),
      width: 200,
      align: 'center',
      render: (_, record) => record.overtimeHours,
    },
    {
      key: 'allowanceAmount', // Map từ allowanceAmount
      title: t('payrollCalculation.columns.allowance'),
      width: 120,
      align: 'end',
      render: (_, record) => (
        <span className="text-success">+{record.allowanceAmount?.toLocaleString('vi-VN')}</span>
      ),
    },
    {
      key: 'overtimeAmount', // Tạm map vào bonus nếu API không có trường bonus riêng
      title: t('payrollCalculation.columns.bonus'),
      width: 120,
      align: 'end',
      render: (_, record) => (
        <span className="text-primary">+{record.overtimeAmount?.toLocaleString('vi-VN')}</span>
      ),
    },
    {
      key: 'deductionAmount', // Map từ deductionAmount
      title: t('payrollCalculation.columns.deduction'),
      width: 120,
      align: 'end',
      render: (_, record) => (
        <span className="text-danger">-{record.deductionAmount?.toLocaleString('vi-VN')}</span>
      ),
    },
    {
      key: 'netPay', // Map từ netPay
      title: t('payrollCalculation.columns.net_salary'),
      width: 140,
      align: 'end',
      render: (_, record) => <span>{formatCurrency(record.netPay)}</span>,
    },
    {
      key: 'status',
      title: t('payrollCalculation.columns.status'),
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Chip color={record.confirmationStatus === 'APPROVED' ? 'success' : 'default'}>
          {record.confirmationStatus}
        </Chip>
      ),
    },
    {
      key: 'action',
      title: t('payrollCalculation.columns.action'),
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Button
          color="primary"
          variant="bordered"
          onPress={() =>
            navigate({
              to: `/admin/payroll-management/payroll-calculation/${record.payrollResultId}`,
              search: { staffId: record.staffId },
            })
          }
        >
          {t('attendance_data.viewDetail')}
        </Button>
      ),
    },
  ];

  return { columns };
};
