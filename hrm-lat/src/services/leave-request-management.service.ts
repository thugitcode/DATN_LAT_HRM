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
import type { AttendanceExplanation } from '@/features/timekeeping-shift-scheduling/accountability-management/types';
import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from './constants/endpoints';

class LeaveRequestManagementService extends BaseApiService<LeaveRequest> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.LEAVE_REQUEST);
  }

  async getAll(
    params?: LeaveRequestManagementFilters,
  ): Promise<ApiResponse<LeaveRequest[], MetadataLeaveRequest>> {
    const res = await this.request(async () => {
      const response = await this.instance.get(this.url(), {
        params: { ...DEFAULT_PAGINATION, ...params },
        paramsSerializer: (p: Record<string, unknown>) =>
          Object.entries(p)
            .flatMap(([key, val]) =>
              Array.isArray(val)
                ? val.map((v) => `${key}=${encodeURIComponent(v as string)}`)
                : val != null
                  ? [`${key}=${encodeURIComponent(val as string)}`]
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

  async managerApprove(id: string, payload?: ApproveLeaveRequestPayload): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.post(`${this.url(id)}/manager-approve`, payload);
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