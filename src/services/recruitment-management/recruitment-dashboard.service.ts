import type {
  ICandidateSource,
  IRecruitmentByDepartment,
  IRecruitmentPeriod,
  IRecruitmentSummary,
  RecruitmentDashboardParams,
} from '@/features/recruitment-management/report/types/recruitment-dashboard.type';
import { hrmInstance } from '@/lib/axios';
import type { ApiResponse } from '@/types';
import { API_ENDPOINTS } from '../constants/endpoints';

const BASE = API_ENDPOINTS.HRM.DASHBOARD_RECRUITMENT;

class RecruitmentDashboardService {
  async getPeriod(params: RecruitmentDashboardParams): Promise<ApiResponse<IRecruitmentPeriod>> {
    const res = await hrmInstance.get(`${BASE}/period`, { params });
    return res.data;
  }

  async getSummary(params: RecruitmentDashboardParams): Promise<ApiResponse<IRecruitmentSummary>> {
    const res = await hrmInstance.get(`${BASE}/summary`, { params });
    return res.data;
  }

  async getByDepartment(params: RecruitmentDashboardParams): Promise<ApiResponse<IRecruitmentByDepartment>> {
    const res = await hrmInstance.get(`${BASE}/by-department`, { params });
    return res.data;
  }

  async getCandidateSource(params: RecruitmentDashboardParams): Promise<ApiResponse<ICandidateSource>> {
    const res = await hrmInstance.get(`${BASE}/candidate-source`, { params });
    return res.data;
  }
}

export const recruitmentDashboardService = new RecruitmentDashboardService();
