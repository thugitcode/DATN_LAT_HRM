import { useQuery } from '@tanstack/react-query';

import { interviewScheduleQueryOptions } from '@/services/query-options/recruitment-management/interview-schedule.query';
import type { InterviewScheduleFilters } from '../types/interview.type';

export function useInterviewSchedule(recruitmentRequestId: string, params?: InterviewScheduleFilters) {
  return useQuery(interviewScheduleQueryOptions.list(recruitmentRequestId, params));
}
