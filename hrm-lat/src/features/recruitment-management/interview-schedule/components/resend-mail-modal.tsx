import { useTranslation } from 'react-i18next';
import { Button, addToast } from '@heroui/react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IconMail } from '@tabler/icons-react';

import { NAMESPACES } from '@/i18n/constants';
import { interviewScheduleService } from '@/services/recruitment-management/interview-schedule.service';
import { useModal } from '@/store/useModal';

import { EmailSection } from './email-section';

const schema = z.object({
  emailTo: z.string().min(1),
  emailSubject: z.string().min(1),
  emailContent: z.string().min(1),
});

type ResendMailValues = z.infer<typeof schema>;

export function ResendMailModal() {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);
  const onClose = useModal((s) => s.onClose);
  const data = useModal((s) => s.data) as { id: string };

  const { control, handleSubmit } = useForm<ResendMailValues>({
    resolver: zodResolver(schema),
    defaultValues: { emailTo: '', emailSubject: '', emailContent: '' },
  });

  const { mutate: sendEmail, isPending } = useMutation({
    mutationFn: (payload: ResendMailValues) => interviewScheduleService.sendEmail(data?.id, payload),
    onSuccess: () => {
      addToast({ title: t('interview_schedule.actions.resend_mail_success'), color: 'success' });
      onClose();
    },
    onError: () => {
      addToast({ title: t('interview_schedule.actions.resend_mail_error'), color: 'danger' });
    },
  });

  return (
    <div className="flex flex-col gap-4 p-4">
      <EmailSection control={control} isRequired={true} />
      <div className="flex justify-end gap-2">
        <Button
          variant="bordered"
          className="rounded-xl font-medium border-1 text-xs"
          onPress={onClose}
        >
          {tc('button.cancel')}
        </Button>
        <Button
          color="primary"
          className="rounded-xl font-medium text-xs"
          isLoading={isPending}
          startContent={<IconMail size={15} />}
          onPress={() => handleSubmit((data) => sendEmail(data))()}
        >
          {t('interview_schedule.actions.resend_mail')}
        </Button>
      </div>
    </div>
  );
}
