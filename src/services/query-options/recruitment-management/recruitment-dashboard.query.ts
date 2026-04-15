import { queryOptions } from '@tanstack/react-query';

import type { RecruitmentDashboardParams } from '@/features/recruitment-management/report/types/recruitment-dashboard.type';
import { recruitmentDashboardService } from '@/services/recruitment-management/recruitment-dashboard.service';

const keys = {
  all: ['recruitment-dashboard'] as const,
  period: (params: RecruitmentDashboardParams) => [...keys.all, 'period', params] as const,
  summary: (params: RecruitmentDashboardParams) => [...keys.all, 'summary', params] as const,
  byDepartment: (params: RecruitmentDashboardParams) => [...keys.all, 'by-department', params] as const,
  candidateSource: (params: RecruitmentDashboardParams) => [...keys.all, 'candidate-source', params] as const,
};

export const recruitmentDashboardQueryOptions = {
  period: (params: RecruitmentDashboardParams) =>
    queryOptions({
      queryKey: keys.period(params),
      queryFn: () => recruitmentDashboardService.getPeriod(params),
    }),
  summary: (params: RecruitmentDashboardParams) =>
    queryOptions({
      queryKey: keys.summary(params),
      queryFn: () => recruitmentDashboardService.getSummary(params),
    }),
  byDepartment: (params: RecruitmentDashboardParams) =>
    queryOptions({
      queryKey: keys.byDepartment(params),
      queryFn: () => recruitmentDashboardService.getByDepartment(params),
    }),
  candidateSource: (params: RecruitmentDashboardParams) =>
    queryOptions({
      queryKey: keys.candidateSource(params),
      queryFn: () => recruitmentDashboardService.getCandidateSource(params),
    }),
} as const;
