import { PayrollPeriodStatus, PayslipStatus } from '../types/payslip-feedback.type';

export const PayslipStatusLabel: Record<PayslipStatus, string> = {
  [PayslipStatus.NOT_SENT]: 'Chưa gửi',
  [PayslipStatus.SENT]: 'Đã gửi',
};

export const PayrollPeriodStatusLabel: Record<PayrollPeriodStatus, string> = {
  [PayrollPeriodStatus.PUBLISHED]: 'Đã phát hành',
  [PayrollPeriodStatus.DRAFT]: 'Nháp',
};
