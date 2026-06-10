import { useDrawer } from '@/store/useDrawer';
import { addToast } from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { hrmInstance, normalizeAxiosError } from '@/lib/axios';

import type { WorkShiftAssignFormValues } from '../schemas/work-shift-assign.schema';

export const assignWorkShift = async (data: WorkShiftAssignFormValues) => {
  const res = await hrmInstance.post('/work-schedule/range', data);
  return res.data;
};

export const useAssignWorkShift = () => {
  const queryClient = useQueryClient();
  const closedDrawer = useDrawer((state) => state.onClose);

  return useMutation({
    mutationFn: assignWorkShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-management'] });
      addToast({
        title: 'Phân ca làm việc thành công',
        color: 'success',
      });
      closedDrawer();
    },
    onError: (error: unknown) => {
      const { message } = normalizeAxiosError(error);
      addToast({
        title: message,
        color: 'danger',
      });
    },
  });
};
