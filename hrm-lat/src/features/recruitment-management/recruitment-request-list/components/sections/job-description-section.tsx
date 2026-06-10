import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormArea } from '@/components/form-fields/form-area';
import { NAMESPACES } from '@/i18n/constants';

interface JobDescriptionSectionProps {
  isReadOnly?: boolean;
  variant?: 'flat' | 'bordered' | 'faded' | 'underlined';
}

export const JobDescriptionSection = ({ isReadOnly, variant }: JobDescriptionSectionProps) => {
  const { control } = useFormContext();
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
      <h3 className="text-lg font-medium text-[#11181C] tracking-wider">
        {t('form.sections.job_description')}
      </h3>

      <FormArea
        control={control}
        name="description"
        label={t('form.fields.description')}
        isRequired
        placeholder={t('form.placeholders.enter_description')}
        minRows={5}
        readOnly={isReadOnly}
        variant={variant}
      />
    </div>
  );
};
