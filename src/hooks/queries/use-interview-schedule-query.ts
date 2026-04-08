import { interviewScheduleService } from '@/services/recruitment-management/interview-schedule.service';

import type {
  InterviewSchedule,
  InterviewScheduleFilters,
} from '@/features/recruitment-management/recruitment-request-details/types/interview.type';

import { createCrudHooks, QUERY_KEY } from '../use-crud-query';

export const {
  useList: useInterviewScheduleList,
  useDetail: useInterviewScheduleDetail,
  useCreate: useCreateInterviewSchedule,
  useUpdate: useUpdateInterviewSchedule,
  useDelete: useDeleteInterviewSchedule,
} = createCrudHooks<
  InterviewSchedule,
  InterviewScheduleFilters,
  Partial<InterviewSchedule>,
  Partial<InterviewSchedule>
>([QUERY_KEY.INTERVIEW_SCHEDULE], interviewScheduleService);
