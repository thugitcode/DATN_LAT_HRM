// services/accountability-management.service.ts

import { DEFAULT_PAGINATION } from '@/query-options/constants';

import type { ApiResponse } from '@/types';
import { hrmInstance } from '@/lib/axios';
import type {
  ApproveAttendancePayload,
  AttendanceExplanation,
  AttendanceExplanationFilters,
  AttendanceExplanationSummary,
  BulkApprovePayload,
  RejectAttendancePayload,
} from '@/features/timekeeping-shift-scheduling/accountability-management/types';

import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from './constants/endpoints';

class AccountabilityManagementService extends BaseApiService<
  AttendanceExplanation,
  never, // Create — nếu FE không tạo thì để never
  never, // Update
  AttendanceExplanationFilters
> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.ATTENDANCE_EXPLANATION);
  }

  async getAll(
    params?: AttendanceExplanationFilters,
  ): Promise<ApiResponse<AttendanceExplanation[], AttendanceExplanationSummary>> {
    const res = await super.getAll({ ...DEFAULT_PAGINATION, ...params });
    return res as ApiResponse<AttendanceExplanation[], AttendanceExplanationSummary>;
  }

  async getDetail(id: string): Promise<ApiResponse<AttendanceExplanation>> {
    return this.request(async () => {
      const res = await this.instance.get(this.url(id));
      return res.data;
    });
  }

  async approve(id: string, payload?: ApproveAttendancePayload): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.post(`${this.url(id)}/approve`, payload);
      return res.data;
    });
  }

  async managerApprove(id: string, payload?: ApproveAttendancePayload): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.post(`${this.url(id)}/manager-approve`, payload);
      return res.data;
    });
  }

  async reject(id: string, payload: RejectAttendancePayload): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.post(`${this.url(id)}/reject`, payload);
      return res.data;
    });
  }

  async bulkApprove(payload: BulkApprovePayload): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.post(`${this.url()}/bulk-approve`, payload);
      return res.data;
    });
  }
}

export const accountabilityManagementService = new AccountabilityManagementService();
