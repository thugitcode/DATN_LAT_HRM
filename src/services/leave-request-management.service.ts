// services/accountability-management.service.ts

import { DEFAULT_PAGINATION } from '@/query-options/constants';

import type { ApiResponse } from '@/types';
import { hrmInstance } from '@/lib/axios';
import type {
  ApproveLeaveRequestPayload,
  LeaveRequest,
  LeaveRequestManagementFilters,
  MetadataLeaveRequest,
  RejectLeaveRequestPayload,
} from '@/features/leave-management/leave-request-management/type';
import type {
  ApproveAttendancePayload,
  AttendanceExplanation,
  BulkApprovePayload,
  RejectAttendancePayload,
} from '@/features/timekeeping-shift-scheduling/accountability-management/types';

import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from './constants/endpoints';

class LeaveRequestManagementService extends BaseApiService<
  LeaveRequest,
  never,
  never,
  LeaveRequestManagementFilters
> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.LEAVE_REQUEST);
  }

  // Chưa có time fix
  async getAll(
    params?: LeaveRequestManagementFilters,
  ): Promise<ApiResponse<LeaveRequest[], MetadataLeaveRequest>> {
    const res = await this.request(async () => {
      const response = await this.instance.get(this.url(), {
        params: { ...DEFAULT_PAGINATION, ...params },
        paramsSerializer: (p) =>
          Object.entries(p)
            .flatMap(([key, val]) =>
              Array.isArray(val)
                ? val.map((v) => `${key}=${encodeURIComponent(v)}`)
                : val != null
                  ? [`${key}=${encodeURIComponent(val)}`]
                  : [],
            )
            .join('&'),
      });
      return response.data;
    });

    return res as ApiResponse<LeaveRequest[], MetadataLeaveRequest>;
  }
  async getDetail(id: string): Promise<ApiResponse<AttendanceExplanation>> {
    return this.request(async () => {
      const res = await this.instance.get(this.url(id));
      return res.data;
    });
  }

  async approve(id: string, payload?: ApproveLeaveRequestPayload): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.post(`${this.url(id)}/approve`, payload);
      return res.data;
    });
  }

  async reject(id: string, payload: RejectLeaveRequestPayload): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.post(`${this.url(id)}/reject`, payload);
      return res.data;
    });
  }
}

export const leaveRequestManagementService = new LeaveRequestManagementService();
