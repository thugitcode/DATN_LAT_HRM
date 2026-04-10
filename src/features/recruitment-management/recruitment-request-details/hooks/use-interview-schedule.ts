import { useInterviewScheduleList } from '@/hooks/queries/use-interview-schedule-query';
import type { InterviewScheduleFilters } from '../types/interview.type';

export function useInterviewSchedule(recruitmentRequestId?: string, params?: InterviewScheduleFilters) {
  return useInterviewScheduleList(
    { ...params, recruitmentRequestId },
    // { enabled: !!recruitmentRequestId },
  );
}
export function useHistoryInterviewed(candidateId: string, params?: InterviewScheduleFilters) {
  return useInterviewScheduleList(
    { ...params, candidateId },
    { enabled: !!candidateId },
  );
}
