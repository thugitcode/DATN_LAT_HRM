import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fetchStaff, fetchStaffDetail, updateStaff, importStaff, createStaff } from '@/services/staff';
import { addToast } from '@heroui/react';

import type { Staff, StaffParams } from '@/types/staff.type';

export const STAFF_QUERY_KEY = {
  list: (params?: StaffParams) => ['staff', 'list', params],
  detail: (id: string) => ['staff', 'detail', id],
};

export const useStaffList = (
  params?: StaffParams,
  options?: {
    enabled?: boolean;
  },
) => {
  return useQuery({
    queryKey: STAFF_QUERY_KEY.list(params),
    queryFn: () => fetchStaff(params),
    enabled: options?.enabled ?? true,
  });
};

export const useStaffDetail = (id: string) => {
  return useQuery({
    queryKey: STAFF_QUERY_KEY.detail(id),
    queryFn: () => fetchStaffDetail(id),
    enabled: !!id,
  });
};

export const useUpdateStaff = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Staff> }) => updateStaff(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['staff', 'list'] });
      addToast({
        title: t('toast.success.update'),
        description: t('toast.description.staff_updated'),
        color: 'success',
      });
    },
    onError: (error: Error) => {
      addToast({
        title: t('toast.error.update'),
        description: error.message || t('toast.description.error_update'),
        color: 'danger',
      });
    },
  });
};

export const useImportStaff = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { rows: any[] }) => importStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'list'] });
      addToast({
        title: t('toast.success.import'),
        description: t('toast.description.staff_imported'),
        color: 'success',
      });
    },
    onError: (error: Error) => {
      addToast({
        title: t('toast.error.import'),
        description: error.message || t('toast.description.error_import'),
        color: 'danger',
      });
    },
  });
};

export const useCreateStaff = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Staff>) => createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'list'] });
      addToast({
        title: t('toast.success.create'),
        description: t('toast.description.staff_created'),
        color: 'success',
      });
    },
    onError: (error: Error) => {
      addToast({
        title: t('toast.error.create'),
        description: error.message || t('toast.description.error_create'),
        color: 'danger',
      });
    },
  });
};
