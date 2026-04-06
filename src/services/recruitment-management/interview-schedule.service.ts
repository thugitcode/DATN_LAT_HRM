import type { ApiResponse } from '@/types';
import { hrmInstance } from '@/lib/axios';
import type {
  InterviewSchedule,
  InterviewScheduleFilters,
} from '@/features/recruitment-management/recruitment-request-details/types/interview.type';
import { BaseApiService } from '../base-api.service';
import { API_ENDPOINTS } from '../constants/endpoints';

class InterviewScheduleService extends BaseApiService<
  InterviewSchedule,
  Partial<InterviewSchedule>,
  Partial<InterviewSchedule>,
  InterviewScheduleFilters
> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.INTERVIEW_SCHEDULE);
  }

  async getByRecruitmentRequest(
    recruitmentRequestId: string,
    params?: InterviewScheduleFilters,
  ): Promise<ApiResponse<InterviewSchedule[]>> {
    return this.request(async () => {
      const res = await this.instance.get(this.url(), {
        params: { ...params, recruitmentRequestId },
      });
      return res.data;
    });
  }
}

export const interviewScheduleService = new InterviewScheduleService();
