import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDrawer } from '@/store/useDrawer';
import { addToast } from '@heroui/react';
import { normalizeAxiosError } from '@/lib/axios';

import { revenueKeys, revenueOptions } from '@/services/query-options/revenue-management/revenue.query';
import type { RequestsParams } from '@/types/global.type';
import { revenueService } from '@/services/revenue-management/revenue.service';
import type { RevenueDataListType } from '@/features/payroll-management/types/revenue.type';

export function useRevenueList(params?: RequestsParams) {
  return useQuery(revenueOptions.list(params));
}

export function useGetDetailRevenue(id: string) {
  return useQuery(revenueOptions.detail(id));
}

export function useCreateRevenueManagement() {
  const queryClient = useQueryClient();
  const closedDrawer = useDrawer((state) => state.onClose);

  return useMutation({
    mutationFn: (data: Partial<RevenueDataListType> | Partial<RevenueDataListType>[]) => {
      const payloads = Array.isArray(data) ? data : [data];
      return Promise.all(payloads.map((p) => revenueService.create(p)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: revenueKeys.lists() });

      addToast({
        description: 'Thêm mới doanh thu thành công.',
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

export function useUpdateRevenueManagement() {
  const queryClient = useQueryClient();
  const closedDrawer = useDrawer((state) => state.onClose);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RevenueDataListType> }) => {
      return revenueService.patch(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: revenueKeys.lists() });

      addToast({
        description: 'Cập nhật doanh thu thành công.',
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

export function useDeleteRevenueManagement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return revenueService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: revenueKeys.lists() });

      addToast({
        description: 'Xóa doanh thu thành công.',
        color: 'success',
      });
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