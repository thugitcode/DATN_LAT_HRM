import { useQuery } from '@tanstack/react-query';
import { payrollFeedbackOptions } from '@/services/query-options/payroll-management/payroll-feedback.query';

import type { RequestsParams } from '@/types/global.type';

export function usePayrollFeedbackList(params?: RequestsParams) {
  return useQuery(payrollFeedbackOptions.list(params));
}
