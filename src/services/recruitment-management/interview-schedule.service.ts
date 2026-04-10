import type { ApiResponse } from '@/types';
import { hrmInstance } from '@/lib/axios';
import type {
  InterviewSchedule,
  InterviewScheduleFilters,
} from '@/features/recruitment-management/recruitment-request-details/types/interview.type';
import { BaseApiService } from '../base-api.service';
import { API_ENDPOINTS } from '../constants/endpoints';

export interface CreateAndSendPayload {
  candidateId: string;
  interviewerId: string;
  content: string;
  interviewMethod: string;
  onlineLink?: string;
  address?: string;
  interviewDate: string;
  startTime: string;
  endTime: string;
  note?: string;
  emailTo: string;
  emailSubject: string;
  emailContent: string;
}

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

  async createAndSend(data: CreateAndSendPayload): Promise<ApiResponse<InterviewSchedule>> {
    return this.request(async () => {
      const res = await this.instance.post(`${this.endpoint}/create-and-send`, data);
      return res.data;
    });
  }
  async sendEmail(id: string, data: Pick<CreateAndSendPayload, 'emailTo' | 'emailSubject' | 'emailContent'>): Promise<ApiResponse<InterviewSchedule>> {
    return this.request(async () => {
      const res = await this.instance.post(`${this.endpoint}/${id}/send-email`, data);
      return res.data;
    });
  }
}

export const interviewScheduleService = new InterviewScheduleService();
