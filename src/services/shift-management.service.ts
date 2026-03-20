import { DEFAULT_PAGINATION } from '@/query-options/constants';

import type {
  StaffAttendanceRecord
} from '@/features/staff-management/time-attendance-management/types';
import type { WorkScheduleDetail } from '@/features/timekeeping-shift-scheduling/shift-management/types/type';
import { hrmInstance } from '@/lib/axios';
import type { ApiResponse } from '@/types';
import type {
  CreateStaffSchedule,
  StaffSchedule,
  UpdateShift,
  UpdateShiftData
} from '@/types/shift-management.type';
import type { StaffParams } from '@/types/staff.type';

import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from './constants/endpoints';

class ShiftManagementService extends BaseApiService<
  StaffSchedule,
  CreateStaffSchedule,
  UpdateShiftData,
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

  async update({ id, data }: UpdateShift) {
    return super.update(id, data);
  }

  async getDetail(id: string): Promise<ApiResponse<WorkScheduleDetail>> {
    return this.request(async () => {
      const res = await this.instance.get(`${this.url(id)}`);

      return res.data;
    });
  }

  async getAllGrid(params?: StaffParams): Promise<ApiResponse<StaffSchedule[]>> {
    return this.request(async () => {
      const res = await this.instance.get(`${this.url()}/calendar`, { params });
      return res.data;
    });
  }

  async getStaffDailyAttendance(
    params?: StaffParams,
  ): Promise<ApiResponse<StaffAttendanceRecord[]>> {
    return this.request(async () => {
      const res = await this.instance.get(`${this.url()}/staff-daily-attendance`, { params });
      return res.data;
    });
  }
}

export const shiftManagementService = new ShiftManagementService();
