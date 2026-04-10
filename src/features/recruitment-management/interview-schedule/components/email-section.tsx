import { useTranslation } from 'react-i18next';
import type { Control } from 'react-hook-form';

import { NAMESPACES } from '@/i18n/constants';
import { FormArea } from '@/components/form-fields/form-area';
import { FormInput } from '@/components/form-fields/form-input';

interface EmailSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  isRequired?: boolean;
}

export function EmailSection({ control, isRequired = false }: EmailSectionProps) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-5">
      <p className="text-sm font-semibold text-[#11181C]">
        {t('interview_schedule.form.sections.message')}
      </p>

      <FormInput
        control={control}
        name="emailTo"
        label={t('interview_schedule.form.fields.email_to')}
        placeholder="example@email.com"
        isRequired={isRequired}
      />

      <FormInput
        control={control}
        name="emailSubject"
        label={t('interview_schedule.form.fields.email_subject')}
        placeholder={t('interview_schedule.form.placeholders.enter')}
        isRequired={isRequired}
      />

      <FormArea
        control={control}
        name="emailContent"
        label={t('interview_schedule.form.fields.email_content')}
        placeholder={t('interview_schedule.form.placeholders.enter')}
        minRows={5}
        isRequired={isRequired}
      />
    </div>
  );
}
