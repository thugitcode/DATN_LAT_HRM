import { staffProfileKeys, staffProfileQueryOptions } from "@/services/query-options/staff-profile.query";
import { staffProfileService } from "@/services/staff-profile.service";
import type { ApiResponse, ShiftManagementParams } from "@/types";
import type { IStaffProfile } from "@/types/staff-profile.type";
import { addToast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useStaffProfileList(params?: ShiftManagementParams) {
  return useQuery(staffProfileQueryOptions.list(params));
}

export function useStaffProfileDetail(id: string) {
  return useQuery(staffProfileQueryOptions.detail(id));
}

export const useUpdateStaffProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IStaffProfile> }): Promise<ApiResponse<IStaffProfile>> =>
      staffProfileService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: staffProfileKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: staffProfileKeys.lists() });
      addToast({
        title: 'Cập nhật hồ sơ thành công',
        description: 'Thông tin hồ sơ nhân viên đã được cập nhật',
        color: 'success',
      });
    },
    onError: (error: Error) => {
      addToast({
        title: 'Cập nhật hồ sơ thất bại',
        description: error.message || 'Có lỗi xảy ra khi cập nhật',
        color: 'danger',
      });
    },
  });
};
export const useCreateStaffProfile = () => {

  return useMutation({
    mutationFn: (data: Partial<IStaffProfile>): Promise<ApiResponse<IStaffProfile>> => {
      return staffProfileService.create(data)
    },

    // onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: staffProfileKeys.lists() });
    //   addToast({
    //     title: 'Thêm mới hồ sơ thành công',
    //     description: 'Thông tin hồ sơ nhân viên đã được cập nhật',
    //     color: 'success',
    //   });
    // },
    // onError: (error: Error) => {
    //   addToast({
    //     title: 'Thêm mới hồ sơ thất bại',
    //     description: error.message || 'Có lỗi xảy ra khi cập nhật',
    //     color: 'danger',
    //   });
    // },
  });
};

export const useDeleteStaffProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string): Promise<ApiResponse<void>> => {
      return staffProfileService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffProfileKeys.lists() });
      addToast({
        title: 'Xóa hồ sơ thành công',
        description: 'Tài liệu đã được xóa',
        color: 'success',
      });
    },
    onError: (error: Error) => {
      addToast({
        title: 'Xóa hồ sơ thất bại',
        description: error.message || 'Có lỗi xảy ra khi xóa',
        color: 'danger',
      });
    },
  });
};
