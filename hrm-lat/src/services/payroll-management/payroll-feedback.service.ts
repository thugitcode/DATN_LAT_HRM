import type { RequestsParams } from '@/types/global.type';
import { hrmInstance } from '@/lib/axios';
import type { PayslipFeedback } from '@/features/payroll-management/types/payslip-feedback.type';

import { BaseApiService } from '../base-api.service';
import { API_ENDPOINTS } from '../constants/endpoints';

class PayrollFeedbackService extends BaseApiService<
  PayslipFeedback,
  unknown,
  unknown,
  RequestsParams
> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.PAYROLL_MANAGEMENT.PAYROLL_FEEDBACK);
  }

  async getAll(params?: RequestsParams) {
    return super.getAll(params);
  }

  async getDetail(id: string) {
    return super.getById(id);
  }
}

export const payrollFeedbackService = new PayrollFeedbackService();
