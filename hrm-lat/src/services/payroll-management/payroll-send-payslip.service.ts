import type { RequestsParams } from '@/types/global.type';
import { hrmInstance } from '@/lib/axios';
import type {
  PayrollApiResponse,
  SendPayslipPayload,
} from '@/features/payroll-management/types/payroll-caculation.type';
import type { ApprovePayload } from '@/features/timekeeping-shift-scheduling/timekeeping-management/types/timekeeping-management.type';

import { BaseApiService } from '../base-api.service';
import { API_ENDPOINTS } from '../constants/endpoints';

class PayrollSendPayslipService extends BaseApiService<
  PayrollApiResponse,
  ApprovePayload,
  PayrollApiResponse,
  RequestsParams
> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.PAYROLL_MANAGEMENT.PAYROLL_SEND_PAYSLIP);
  }

  async sendPayslips(payload: SendPayslipPayload) {
    return super.create(payload);
  }
}

export const payrollSendPayslipService = new PayrollSendPayslipService();