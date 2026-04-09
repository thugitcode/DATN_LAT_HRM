import type {
  CandidateFilters,
  CandidatePayload,
  ICandidate,
  ICreateOfferLetterPayload
} from '@/features/recruitment-management/recruitment-request-details/types/type';
import type { EvaluationFormValues } from '@/features/recruitment-management/candidate/schemas/evaluation-schema';
import type { ICandidateOffer } from '@/features/recruitment-management/types/candidate.type';
import { hrmInstance } from '@/lib/axios';
import type { ApiResponse } from '@/types';
import { BaseApiService } from '../base-api.service';
import { API_ENDPOINTS } from '../constants/endpoints';


class CandidateService extends BaseApiService<ICandidate, CandidatePayload, CandidatePayload, CandidateFilters> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.CANDIDATE);
  }

  async getByRecruitmentRequest(
    recruitmentRequestId?: string,
    params?: CandidateFilters,
  ): Promise<ApiResponse<ICandidate[]>> {
    return this.request(async () => {
      const res = await this.instance.get(
        `${this.url()}`,
        { params: { ...params, recruitmentRequestId } },
      );
      return res.data;
    });
  }
  async getDetailsOffer(candidateId: string): Promise<ApiResponse<ICandidateOffer>> {
    return this.request(async () => {
      const res = await this.instance.get(`${this.url()}/${candidateId}/offer`);
      return res.data;
    });
  }

  async createOffer(candidateId: string, payload: ICreateOfferLetterPayload): Promise<ApiResponse<ICandidateOffer>> {
    return this.request(async () => {
      const res = await this.instance.post(`${this.url()}/${candidateId}/offer`, payload);
      return res.data;
    });
  }

  async updateEvaluation(candidateId: string, payload: Partial<EvaluationFormValues>): Promise<ApiResponse<ICandidate>> {
    return this.request(async () => {
      const res = await this.instance.patch(`${this.url()}/${candidateId}/evaluation`, payload);
      return res.data;
    });
  }
}

export const candidateService = new CandidateService();
