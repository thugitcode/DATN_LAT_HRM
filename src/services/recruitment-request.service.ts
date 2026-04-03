import { DEFAULT_PAGINATION } from '@/query-options/constants';

import type { ApiResponse } from '@/types';
import { hrmInstance } from '@/lib/axios';
import type {
  ApproveRecruitmentRequestPayload,
  RecruitmentRequest,
  RecruitmentRequestFilters,
  MetadataRecruitmentRequest,
  RejectRecruitmentRequestPayload,
} from '@/features/recruitment-management/recruitment-request-list/types/type';
import type { RecruitmentRequestFormValues } from '@/features/recruitment-management/recruitment-request-list/schemas/schema';

import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from './constants/endpoints';

class RecruitmentRequestService extends BaseApiService<
  RecruitmentRequest,
  RecruitmentRequestFormValues,
  RecruitmentRequestFormValues,
  RecruitmentRequestFilters
> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.RECRUITMENT_REQUEST);
  }

  async getAll(
    params?: RecruitmentRequestFilters,
  ): Promise<ApiResponse<RecruitmentRequest[], MetadataRecruitmentRequest>> {
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

    return res as ApiResponse<RecruitmentRequest[], MetadataRecruitmentRequest>;
  }

  async submit(
    id: string,
    payload?: ApproveRecruitmentRequestPayload,
  ): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.patch(`${this.url(id)}/submit`, payload);
      return res.data;
    });
  }
  async approve(
    id: string,
    payload?: ApproveRecruitmentRequestPayload,
  ): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.patch(`${this.url(id)}/approve`, payload);
      return res.data;
    });
  }

  async reject(
    id: string,
    payload: RejectRecruitmentRequestPayload,
  ): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.patch(`${this.url(id)}/reject`, payload);
      return res.data;
    });
  }

  async close(id: string): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.patch(`${this.url(id)}/close`);
      return res.data;
    });
  }
  async openRecruiting(id: string): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.patch(`${this.url(id)}/open-recruiting`);
      return res.data;
    });
  }
  async pauseRecruiting(id: string): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.patch(`${this.url(id)}/pause`);
      return res.data;
    });
  }
  async resumeRecruiting(id: string): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.patch(`${this.url(id)}/resume`);
      return res.data;
    });
  }
  async cancelRecruiting(id: string): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.patch(`${this.url(id)}/cancel`);
      return res.data;
    });
  }
}

export const recruitmentRequestService = new RecruitmentRequestService();
