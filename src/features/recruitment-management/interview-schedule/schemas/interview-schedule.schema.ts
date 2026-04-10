import { z } from 'zod';
import type { TFunction } from 'i18next';
import type { NAMESPACES } from '@/i18n/constants';
import { InterviewMethodEnum } from '@/features/recruitment-management/recruitment-request-details/types/interview.type';

const requiredString = (message: string) =>
  z.preprocess(
    (v) => (v === null || v === undefined ? '' : String(v)),
    z.string().min(1, message),
  );

const optionalString = () =>
  z.preprocess((v) => (v === null || v === undefined ? '' : String(v)), z.string());

export const interviewScheduleSchema = (t: TFunction<typeof NAMESPACES.RECRUITMENT_MANAGEMENT>) =>
  z
    .object({
      candidateId: requiredString(t('interview_schedule.form.validation.candidate_required')),
      interviewerId: requiredString(t('interview_schedule.form.validation.interviewer_required')),
      content: requiredString(t('interview_schedule.form.validation.content_required')),
      interviewMethod: z.nativeEnum(InterviewMethodEnum),
      onlineLink: optionalString(),
      address: optionalString(),
      interviewDate: requiredString(t('interview_schedule.form.validation.date_required')),
      startTime: requiredString(t('interview_schedule.form.validation.start_time_required')),
      endTime: requiredString(t('interview_schedule.form.validation.end_time_required')),
      note: optionalString(),
      emailTo: optionalString(),
      emailSubject: optionalString(),
      emailContent: optionalString(),
      sendMail: z.boolean().default(false),
    })
    .superRefine((data, ctx) => {
      // Online link required when method is ONLINE
      if (data.interviewMethod === InterviewMethodEnum.ONLINE && !data.onlineLink) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('interview_schedule.form.validation.online_link_required'),
          path: ['onlineLink'],
        });
      }

      // Interview date must be >= today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

      if (data.interviewDate && data.interviewDate < todayStr) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('interview_schedule.form.validation.date_past'),
          path: ['interviewDate'],
        });
      }

      // If interview date == today, startTime must be > current time
      if (data.interviewDate && data.interviewDate === todayStr && data.startTime) {
        const now = new Date();
        const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        if (data.startTime <= nowTime) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('interview_schedule.form.validation.start_time_past'),
            path: ['startTime'],
          });
        }
      }

      // End time must be > start time
      if (data.startTime && data.endTime && data.endTime <= data.startTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('interview_schedule.form.validation.end_time_invalid'),
          path: ['endTime'],
        });
      }

      // Email fields required when sending mail
      if (data.sendMail) {
        if (!data.emailTo) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('interview_schedule.form.validation.email_to_required'),
            path: ['emailTo'],
          });
        }
        if (!data.emailSubject) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('interview_schedule.form.validation.email_subject_required'),
            path: ['emailSubject'],
          });
        }
        if (!data.emailContent) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('interview_schedule.form.validation.email_content_required'),
            path: ['emailContent'],
          });
        }
      }
    });

export type InterviewScheduleFormValues = z.infer<ReturnType<typeof interviewScheduleSchema>>;

export const INTERVIEW_SCHEDULE_DEFAULT_VALUES: InterviewScheduleFormValues = {
  candidateId: '',
  interviewerId: '',
  content: '',
  interviewMethod: InterviewMethodEnum.ONLINE,
  onlineLink: '',
  address: '',
  interviewDate: '',
  startTime: '',
  endTime: '',
  note: '',
  emailTo: '',
  emailSubject: '',
  emailContent: '',
  sendMail: false,
};
