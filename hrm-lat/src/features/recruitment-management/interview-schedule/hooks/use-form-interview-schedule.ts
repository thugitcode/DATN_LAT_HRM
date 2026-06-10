import { useQueryClient } from '@tanstack/react-query';
import { NAMESPACES } from '@/i18n/constants';
import { interviewScheduleService } from '@/services/recruitment-management/interview-schedule.service';
import { candidateService } from '@/services/recruitment-management/candidate.service';
import { CandidateStatusEnum } from '@/features/recruitment-management/recruitment-request-details/types/candidate.type';
import { addToast } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useCreateInterviewSchedule, useInterviewScheduleDetail, useUpdateInterviewSchedule } from '@/hooks/queries/use-interview-schedule-query';
import { QUERY_KEY } from '@/hooks/use-crud-query';

import {
  INTERVIEW_SCHEDULE_DEFAULT_VALUES,
  interviewScheduleSchema,
  type InterviewScheduleFormValues,
} from '../schemas/interview-schedule.schema';
import { useEffect } from 'react';
import { normalizeAxiosError } from '@/lib/axios';
import { normalizePayload } from '@/lib/utils';

interface UseFormInterviewScheduleParams {
  interviewId?: string;
  candidateId?: string;
  candidateStatus?: CandidateStatusEnum;
  candidateEmail?: string;
  onSuccess?: () => void;
  onSuccessAndSendMail?: () => void;
}

export function useFormInterviewSchedule({
  interviewId,
  candidateId,
  candidateStatus,
  candidateEmail,
  onSuccess,
  onSuccessAndSendMail,
}: UseFormInterviewScheduleParams = {}) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const queryClient = useQueryClient();
  const { data } = useInterviewScheduleDetail(interviewId)

  const defaultValues: InterviewScheduleFormValues = {
    ...INTERVIEW_SCHEDULE_DEFAULT_VALUES,
    candidateId: candidateId ?? '',
    emailTo: candidateEmail ?? "",
  };

  const methods = useForm<InterviewScheduleFormValues>({
    resolver: zodResolver(interviewScheduleSchema(t)) as Resolver<InterviewScheduleFormValues>,
    defaultValues,
    mode: 'onChange',
  });

  const { mutateAsync: createInterview } = useCreateInterviewSchedule();
  const { mutateAsync: updateInterview } = useUpdateInterviewSchedule();

  useEffect(() => {
    if (data?.data?.id) {
      methods.reset({
        ...INTERVIEW_SCHEDULE_DEFAULT_VALUES,
        ...data.data,
        candidateId: data?.data?.candidate?.id,
        interviewerId: data?.data?.interviewer?.id,
      })
    }
  }, [data])

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async () => {
    setValue('sendMail', false, { shouldValidate: false });
    await handleSubmit(async (data) => {
      try {
        const { emailTo: _e, emailSubject: _s, emailContent: _c, sendMail: _m, ...payload } = data;
        if (interviewId) {
          await updateInterview(
            { id: interviewId, data: normalizePayload(payload) },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEY.INTERVIEW_SCHEDULE, 'list'] });
                addToast({
                  title: t('interview_schedule.form.toast.update_success'),
                  color: 'success',
                });
                onSuccess?.();
              },
              onError: () => {
                addToast({ title: t('interview_schedule.form.toast.update_error'), color: 'danger' });
              },
            },
          );
        } else {
          await createInterview(normalizePayload(payload), {
            onSuccess: async () => {
              if (candidateId && candidateStatus === CandidateStatusEnum.SCREENED) {
                await candidateService.patch(candidateId, { status: CandidateStatusEnum.WAITING_INTERVIEW });
              }
              queryClient.invalidateQueries({ queryKey: [QUERY_KEY.INTERVIEW_SCHEDULE, 'list'] });
              queryClient.invalidateQueries({ queryKey: [QUERY_KEY.CANDIDATE, 'list'] });
              addToast({
                title: t('interview_schedule.form.toast.create_success'),
                color: 'success',
              });
              onSuccess?.();
            },
            onError: (error: unknown) => {
              const { message } = normalizeAxiosError(error);
              addToast({
                title: message,
                color: 'danger',
              });
            },
          });
        }
      } catch {
        // addToast({
        //   title: t(`interview_schedule.form.toast.${interviewId ? 'update' : 'create'}_error`),
        //   color: 'danger',
        // });
      }
    })();
  };

  const onSubmitAndSendMail = async () => {
    setValue('sendMail', true, { shouldValidate: false });
    await handleSubmit(async (data) => {
      try {
        if (interviewId) {
          await interviewScheduleService.update(interviewId, normalizePayload(data));
          await interviewScheduleService.sendEmail(interviewId, {
            emailTo: data.emailTo,
            emailSubject: data.emailSubject,
            emailContent: data.emailContent,
          });
        } else {
          await interviewScheduleService.createAndSend(normalizePayload({
            candidateId: data.candidateId,
            interviewerId: data.interviewerId,
            content: data.content,
            interviewMethod: data.interviewMethod,
            onlineLink: data.onlineLink,
            address: data.address,
            interviewDate: data.interviewDate,
            startTime: data.startTime,
            endTime: data.endTime,
            note: data.note,
            emailTo: data.emailTo,
            emailSubject: data.emailSubject,
            emailContent: data.emailContent,
          }));
        }

        if (candidateId && candidateStatus === CandidateStatusEnum.SCREENED) {
          await candidateService.patch(candidateId, { status: CandidateStatusEnum.WAITING_INTERVIEW });
        }
        addToast({
          title: t(`interview_schedule.form.toast.${interviewId ? 'update' : 'create'}_success`),
          color: 'success',
        });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY.INTERVIEW_SCHEDULE, 'list'] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY.CANDIDATE, 'list'] });
        onSuccessAndSendMail?.();
      } catch (error: unknown) {
        const { message } = normalizeAxiosError(error);
        addToast({
          title: message,
          color: 'danger',
        });
      }
    })();
  };

  return { methods, isSubmitting, onSubmit, onSubmitAndSendMail };
}
