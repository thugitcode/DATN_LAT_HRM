import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { kpiService } from '@/services/payroll-management/kpi.service';
import { otherIncomeService } from '@/services/payroll-management/other-income.service';
import { payrollPerriodsService } from '@/services/payroll-management/payroll-periods.service';
import { payrollSummaryFinalizeService } from '@/services/payroll-management/payroll-summary-finalize';
import { salaryHistoryService } from '@/services/payroll-management/salary-history.service';
import { kpiKeys, kpiOptions } from '@/services/query-options/payroll-management/kpi.query';
import {
  otherIncomeKeys,
  otherIncomeOptions,
} from '@/services/query-options/payroll-management/other-income.query';
import { payrollFeedbackOptions } from '@/services/query-options/payroll-management/payroll-feedback.query';
import {
  payrollPeriodsKeys,
  payrollPeriodsOptions,
} from '@/services/query-options/payroll-management/payroll-periods.query';
import { useDrawer } from '@/store/useDrawer';
import { addToast } from '@heroui/react';

import type { RequestsParams } from '@/types/global.type';
import { normalizeAxiosError } from '@/lib/axios';
import type { ApprovePayload } from '@/features/timekeeping-shift-scheduling/timekeeping-management/types/timekeeping-management.type';

import type { KpiMutatePayload, KpiUpdate } from '../types/kpi.type';
import type { OtherIncomePayload, OtherUpdate } from '../types/other-income.type';

export function usePayrollFeedbackList(params?: RequestsParams) {
  return useQuery(payrollFeedbackOptions.list(params));
}

export function useKpiList(params?: RequestsParams) {
  return useQuery(kpiOptions.list(params));
}

export function useKpiDetail(id: string) {
  return useQuery(kpiOptions.detail(id));
}

export function useOtherIncomeList(params?: RequestsParams) {
  return useQuery(otherIncomeOptions.list(params));
}
export function useOtherIncomeDetail(id: string) {
  return useQuery(otherIncomeOptions.detail(id));
}

export function usePayrollPeridStatus(month: string) {
  return useQuery(payrollPeriodsOptions.status(month));
}

export function useStaffSalary(id: string) {
  return useQuery({
    queryKey: ['staff-salary', id],
    queryFn: () => salaryHistoryService.getStaffSalary(id),
    enabled: !!id,
  });
}

const PAYROLL_SUMMARY_QUERY_KEYS = {
  summary: (month: string) => ['payroll-summary', 'summary', month] as const,
};

export const usePayrollSummary = (month: string) => {
  return useQuery({
    queryKey: PAYROLL_SUMMARY_QUERY_KEYS.summary(month),
    queryFn: () => payrollSummaryFinalizeService.getSumary(month),
    enabled: !!month,
    select: (res) => res.data,
    meta: { silentError: true }
  });
};

export function useCreateKPIManagement() {
  const queryClient = useQueryClient();
  const closedDrawer = useDrawer((state) => state.onClose);

  return useMutation({
    mutationFn: (data: KpiMutatePayload) => kpiService.create(data),
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

export function useUpdateKPIManagement() {
  const queryClient = useQueryClient();
  const closedDrawer = useDrawer((state) => state.onClose);

  return useMutation({
    mutationFn: ({ id, payload }: KpiUpdate) => kpiService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kpiKeys.lists() });

      addToast({
        description: 'Chỉnh sửa KPI thành công.',
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

export function useCreateOtherIncome() {
  const queryClient = useQueryClient();
  const closedDrawer = useDrawer((state) => state.onClose);

  return useMutation({
    mutationFn: (data: OtherIncomePayload) => otherIncomeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: otherIncomeKeys.lists() });

      addToast({
        description: 'Thêm mới khoản phát sinh thành công.',
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

export function useUpdateOtherIncome() {
  const queryClient = useQueryClient();
  const closedDrawer = useDrawer((state) => state.onClose);

  return useMutation({
    mutationFn: ({ id, payload }: OtherUpdate) => otherIncomeService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: otherIncomeKeys.lists() });

      addToast({
        description: 'Cập nhập khoản phát sinh thành công.',
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

export function useDeleteOtherIncomeManagement() {
  const queryClient = useQueryClient();
  const closedDrawer = useDrawer((state) => state.onClose);

  return useMutation({
    mutationFn: (id: string) => otherIncomeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: otherIncomeKeys.lists() });

      addToast({
        description: 'Xóa khoản phát sinh thành công.',
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

export function useCalculateMutation(month: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: ApprovePayload) => payrollPerriodsService.calculate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: payrollPeriodsKeys.status(month),
      });

      addToast({
        description: 'Chuyển tính lương thành công.',
        color: 'success',
      });

      navigate({
        to: '/admin/payroll-management/payroll-calculation',
        search: {
          month,
        },
      });
    },
  });
}

export function useSaveDraftMutation(month: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ApprovePayload) => payrollPerriodsService.saveDraft(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: payrollPeriodsKeys.status(month),
      });

      addToast({
        description: 'Lưu nháp thành công.',
        color: 'success',
      });
    },
  });
}
