import type { ApiResponse } from '@/types';
import { hrmInstance } from '@/lib/axios';
import type {
  Candidate,
  CandidateFilters,
} from '@/features/recruitment-management/recruitment-request-details/types/type';
import { BaseApiService } from '../base-api.service';
import { API_ENDPOINTS } from '../constants/endpoints';


class CandidateService extends BaseApiService<Candidate, Partial<Candidate>, Partial<Candidate>, CandidateFilters> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.CANDIDATE);
  }

  async getByRecruitmentRequest(
    recruitmentRequestId: string,
    params?: CandidateFilters,
  ): Promise<ApiResponse<Candidate[]>> {
    return this.request(async () => {
      const res = await this.instance.get(
        `${this.url()}`,
        { params: { ...params, recruitmentRequestId } },
      );
      return res.data;
    });
  }
}

export const candidateService = new CandidateService();
