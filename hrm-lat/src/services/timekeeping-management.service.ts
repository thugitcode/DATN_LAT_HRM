import { DEFAULT_PAGINATION } from '@/query-options/constants';

import type { ApiResponse } from '@/types';
import type { CreateStaffSchedule } from '@/types/shift-management.type';
import type { StaffParams } from '@/types/staff.type';
import { hrmInstance } from '@/lib/axios';
import type { ShiftDetails } from '@/features/timekeeping-shift-scheduling/timekeeping-management/components/detailed-time-sheet/type';
import type { shiftDetailsFormValues } from '@/features/timekeeping-shift-scheduling/timekeeping-management/schemas/shift-details.schema';
import type {
  AttendanceByHoursResponse,
  WorkSheetByShiftType,
} from '@/features/timekeeping-shift-scheduling/timekeeping-management/types/timekeeping-management.type';

import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from './constants/endpoints';

class TimekeepingManagementService extends BaseApiService<
  WorkSheetByShiftType,
  CreateStaffSchedule,
  // UpdateStaffSchedule,
  StaffParams
> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.WORK_SCHEDULE);
  }

  async getAttendanceTable(params?: StaffParams) {
    return this.request(async () => {
      const res = await hrmInstance.get<ApiResponse<WorkSheetByShiftType[]>>(
        API_ENDPOINTS.HRM._WORK_SCHEDULE.ATTENDANCE_TABLE,
        {
          params: { ...DEFAULT_PAGINATION, ...params },
        },
      );
      return res.data;
    });
  }

  async getAttendanceByHours(params?: StaffParams) {
    return this.request(async () => {
      const res = await hrmInstance.get<ApiResponse<AttendanceByHoursResponse[]>>(
        API_ENDPOINTS.HRM._WORK_SCHEDULE.ATTENDANCE_BY_HOURS,
        {
          params: { ...DEFAULT_PAGINATION, ...params },
        },
      );
      return res.data;
    });
  }

  async getDetail(id: string): Promise<ApiResponse<ShiftDetails>> {
    return this.request(async () => {
      const res = await this.instance.get(`${this.url()}/work-schedule-detail/${id}`);

      return res.data;
    });
  }
  async updateAttendance(
    id: string,
    body: shiftDetailsFormValues & { id: string },
  ): Promise<ApiResponse<ShiftDetails>> {
    return this.request(async () => {
      const { id: _, ...newBody } = body;
      const res = await this.instance.patch(`${this.url()}/detail/${id}/attendance`, newBody);

      return res.data;
    });
  }
}

export const timekeepingManagementService = new TimekeepingManagementService();
