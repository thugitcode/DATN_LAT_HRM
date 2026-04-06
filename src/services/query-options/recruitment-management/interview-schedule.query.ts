import { queryOptions } from '@tanstack/react-query';

import type { InterviewScheduleFilters } from '@/features/recruitment-management/recruitment-request-details/types/interview.type';
import { interviewScheduleService } from '@/services/recruitment-management/interview-schedule.service';

export const interviewScheduleKeys = {
  all: ['interview-schedule'] as const,
  lists: () => [...interviewScheduleKeys.all, 'list'] as const,
  list: (recruitmentRequestId: string, params?: InterviewScheduleFilters) =>
    [...interviewScheduleKeys.lists(), recruitmentRequestId, params] as const,
} as const;

export const interviewScheduleQueryOptions = {
  list: (recruitmentRequestId: string, params?: InterviewScheduleFilters) =>
    queryOptions({
      queryKey: interviewScheduleKeys.list(recruitmentRequestId, params),
      queryFn: () =>
        interviewScheduleService.getByRecruitmentRequest(recruitmentRequestId, params),
      enabled: !!recruitmentRequestId,
    }),
} as const;
