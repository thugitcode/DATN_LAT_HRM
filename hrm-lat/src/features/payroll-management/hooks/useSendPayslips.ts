import { useMutation } from '@tanstack/react-query';
import { payrollSendPayslipService } from '@/services/payroll-management/payroll-send-payslip.service';
import { addToast } from '@heroui/react';

import type { SendPayslipPayload } from '../types/payroll-caculation.type';

export function useSendPayslips() {
  return useMutation({
    mutationFn: (payload: SendPayslipPayload) => payrollSendPayslipService.create(payload),
    onSuccess: () => {
      addToast({
        description: 'Gửi phiếu lương thành công.',
        color: 'success',
      });
    },
  });
}
