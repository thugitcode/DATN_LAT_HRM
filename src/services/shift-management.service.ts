import { DEFAULT_PAGINATION } from '@/query-options/constants';

import type {
  CreateStaffSchedule,
  StaffSchedule,
  UpdateStaffSchedule,
} from '@/types/shift-management.type';
import type { StaffParams } from '@/types/staff.type';
import { hrmInstance } from '@/lib/axios';

import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from './constants/endpoints';

class ShiftManagementService extends BaseApiService<
  StaffSchedule,
  CreateStaffSchedule,
  UpdateStaffSchedule,
  StaffParams
> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.WORK_SCHEDULE);
  }

  async getAll(params?: StaffParams) {
    return super.getAll({ ...DEFAULT_PAGINATION, ...params });
  }

  async create(data: CreateStaffSchedule) {
    return this.request(async () => {
      const res = await hrmInstance.post(API_ENDPOINTS.HRM.WORK_SCHEDULE_RANGE, data);
      return res.data;
    });
  }
}

export const shiftManagementService = new ShiftManagementService();
