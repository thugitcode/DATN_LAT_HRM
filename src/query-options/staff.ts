import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Staff> }) => updateStaff(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['staff', 'list'] });
      addToast({
        title: 'Cập nhật thành công',
        description: 'Thông tin nhân viên đã được cập nhật',
        color: 'success',
      });
    },
    onError: (error: Error) => {
      addToast({
        title: 'Cập nhật thất bại',
        description: error.message || 'Có lỗi xảy ra khi cập nhật',
        color: 'danger',
      });
    },
  });
};

export const useImportStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { rows: any[] }) => importStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'list'] });
      addToast({
        title: 'Import thành công',
        description: 'Danh sách nhân viên đã được tải lên',
        color: 'success',
      });
    },
    onError: (error: Error) => {
      addToast({
        title: 'Import thất bại',
        description: error.message || 'Có lỗi xảy ra khi tải lên dữ liệu',
        color: 'danger',
      });
    },
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Staff>) => createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'list'] });
      addToast({
        title: 'Thêm mới thành công',
        description: 'Nhân viên mới đã được tạo',
        color: 'success',
      });
    },
    onError: (error: Error) => {
      addToast({
        title: 'Thêm mới thất bại',
        description: error.message || 'Có lỗi xảy ra khi thêm mới',
        color: 'danger',
      });
    },
  });
};
