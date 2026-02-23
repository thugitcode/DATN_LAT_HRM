import { shiftManagementService } from '@/services/shift-management.service';

import type { ShiftManagementParams, Staff } from '@/types/shift-management.type';

import { createCrudHooks } from '../use-crud-query';

export const {
  useList: useShiftManagementList,
  useDetail: useShiftManagementDetail,
  useCreate: useCreateShiftManagement,
  useUpdate: useUpdateShiftManagement,
  useDelete: useDeleteShiftManagement,
} = createCrudHooks<Staff, ShiftManagementParams>(['shift-management'], shiftManagementService);
