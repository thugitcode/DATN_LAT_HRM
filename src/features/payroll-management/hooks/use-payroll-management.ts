import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { kpiService } from '@/services/payroll-management/kpi.service';
import { kpiKeys, kpiOptions } from '@/services/query-options/payroll-management/kpi.query';
import { payrollFeedbackOptions } from '@/services/query-options/payroll-management/payroll-feedback.query';
import { useDrawer } from '@/store/useDrawer';
import { addToast } from '@heroui/react';

import type { RequestsParams } from '@/types/global.type';
import { normalizeAxiosError } from '@/lib/axios';

import type { KpiMutatePayload } from '../types/kpi.type';

export function usePayrollFeedbackList(params?: RequestsParams) {
  return useQuery(payrollFeedbackOptions.list(params));
}

export function useKpiList(params?: RequestsParams) {
  return useQuery(kpiOptions.list(params));
}

export function useKpiDetail(id: string) {
  return useQuery(kpiOptions.detail(id));
}

export function useCreateKPIManagement() {
  const queryClient = useQueryClient();
  const closedDrawer = useDrawer((state) => state.onClose);

  return useMutation({
    mutationFn: (data: KpiMutatePayload) => {
      const payloads = Array.isArray(data) ? data : [data];
      return Promise.all(payloads.map((p) => kpiService.create(p)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kpiKeys.lists() });

      addToast({
        description: 'Thêm mới KPI thành công.',
        color: 'success',
      });
      closedDrawer();
    },
    onError: (error: unknown) => {
      const { message } = normalizeAxiosError(error);
      addToast({
        description: message,
        color: 'danger',
      });
    },
  });
}
