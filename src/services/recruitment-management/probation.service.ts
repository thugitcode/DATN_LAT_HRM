import { hrmInstance } from '@/lib/axios';
import type { ApiResponse } from '@/types';

import { BaseApiService } from '../base-api.service';
import { API_ENDPOINTS } from '../constants/endpoints';
import type { ProbationCreatePayload, ProbationFilters, ProbationItem } from '@/features/recruitment-management/probation-management/types/probation.type';
import { DEFAULT_PAGINATION } from '@/query-options/constants';

class ProbationService extends BaseApiService<ProbationItem, never, never, ProbationFilters> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.PROBATION);
  }

  async getAll(params?: ProbationFilters): Promise<ApiResponse<ProbationItem[]>> {
    return this.request(async () => {
      const res = await this.instance.get(this.url(), {
        params: { ...DEFAULT_PAGINATION, ...params },
      });
      return res.data;
    });
  }

  async createFromCandidate(payload: ProbationCreatePayload): Promise<ApiResponse<ProbationItem>> {
    return this.request(async () => {
      const res = await this.instance.post(this.url(), payload);
      return res.data;
    });
  }

  async resendInvitation(id: string): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.patch(`${this.url(id)}/resend-invitation`);
      return res.data;
    });
  }

  async evaluate(id: string): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.patch(`${this.url(id)}/evaluate`);
      return res.data;
    });
  }

  async extend(id: string): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.patch(`${this.url(id)}/extend`);
      return res.data;
    });
  }

  async endEarly(id: string): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.patch(`${this.url(id)}/end-early`);
      return res.data;
    });
  }

  async acceptOfficial(id: string, payload?: Record<string, unknown>): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.patch(`${this.url(id)}/accept-official`, payload);
      return res.data;
    });
  }

  async updateExtension(id: string): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.patch(`${this.url(id)}/update-extension`);
      return res.data;
    });
  }

  async endProbation(id: string): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.patch(`${this.url(id)}/end`);
      return res.data;
    });
  }

  async cancelAcceptance(id: string): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.patch(`${this.url(id)}/cancel`);
      return res.data;
    });
  }
}

export const probationService = new ProbationService();
