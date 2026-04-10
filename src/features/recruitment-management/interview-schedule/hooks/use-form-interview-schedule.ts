import { useQueryClient } from '@tanstack/react-query';
import { NAMESPACES } from '@/i18n/constants';
import { interviewScheduleService } from '@/services/recruitment-management/interview-schedule.service';
import { addToast } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useCreateInterviewSchedule, useInterviewScheduleDetail } from '@/hooks/queries/use-interview-schedule-query';
import { QUERY_KEY } from '@/hooks/use-crud-query';

import {
  INTERVIEW_SCHEDULE_DEFAULT_VALUES,
  interviewScheduleSchema,
  type InterviewScheduleFormValues,
} from '../schemas/interview-schedule.schema';
import { useEffect } from 'react';

interface UseFormInterviewScheduleParams {
  interviewId?: string;
  candidateId?: string;
  onSuccess?: () => void;
  onSuccessAndSendMail?: () => void;
}

export function useFormInterviewSchedule({
  interviewId,
  candidateId,
  onSuccess,
  onSuccessAndSendMail,
}: UseFormInterviewScheduleParams = {}) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const queryClient = useQueryClient();
  const { data } = useInterviewScheduleDetail(interviewId)

  const defaultValues: InterviewScheduleFormValues = {
    ...INTERVIEW_SCHEDULE_DEFAULT_VALUES,
    candidateId: candidateId ?? '',
  };

  const methods = useForm<InterviewScheduleFormValues>({
    resolver: zodResolver(interviewScheduleSchema(t)) as Resolver<InterviewScheduleFormValues>,
    defaultValues,
    mode: 'onChange',
  });

  const { mutateAsync: createInterview } = useCreateInterviewSchedule();

  useEffect(() => {
    if (data?.data?.id) {
      methods.reset({
        ...INTERVIEW_SCHEDULE_DEFAULT_VALUES,
        ...data.data,
        candidateId: data?.data?.candidate?.id,
        interviewerId: data?.data?.interviewer?.id
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
        await createInterview(payload, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY.INTERVIEW_SCHEDULE, 'list'] });
            addToast({
              title: t('interview_schedule.form.toast.create_success'),
              color: 'success',
            });
            onSuccess?.();
          },
          onError: () => {
            addToast({ title: t('interview_schedule.form.toast.create_error'), color: 'danger' });
          },
        });
      } catch {
        addToast({ title: t('interview_schedule.form.toast.create_error'), color: 'danger' });
      }
    })();
  };

  const onSubmitAndSendMail = async () => {
    setValue('sendMail', true, { shouldValidate: false });
    await handleSubmit(async (data) => {
      try {
        await interviewScheduleService.createAndSend({
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
        });
        addToast({ title: t('interview_schedule.form.toast.create_success'), color: 'success' });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY.INTERVIEW_SCHEDULE, 'list'] });
        onSuccessAndSendMail?.();
      } catch {
        addToast({ title: t('interview_schedule.form.toast.create_error'), color: 'danger' });
      }
    })();
  };

  return { methods, isSubmitting, onSubmit, onSubmitAndSendMail };
}
