import { staffService } from '@/services/staff.service';

import type { Staff } from '@/types/shift-management.type';
import type { StaffParams } from '@/types/staff.type';

import { createCrudHooks } from '../use-crud-query';

export const {
  useList: useStaffList,
  useDetail: useStaffDetail,
  useCreate: useCreateStaff,
  useUpdate: useUpdateStaff,
  useDelete: useDeleteStaff,
} = createCrudHooks<Staff, StaffParams>(['staff'], staffService);
