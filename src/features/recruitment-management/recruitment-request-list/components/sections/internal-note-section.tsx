import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormArea } from '@/components/form-fields/form-area';
import { NAMESPACES } from '@/i18n/constants';

interface InternalNoteSectionProps {
  isReadOnly?: boolean;
  variant?: 'flat' | 'bordered' | 'faded' | 'underlined';
}

export const InternalNoteSection = ({ isReadOnly, variant }: InternalNoteSectionProps) => {
  const { control } = useFormContext();
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
      <h3 className="text-lg font-medium text-[#11181C] tracking-wider">
        {t('form.sections.internal_note')}
      </h3>

      <FormArea
        control={control}
        name="note"
        label={t('form.fields.note')}
        placeholder={t('form.placeholders.enter_note')}
        minRows={3}
        readOnly={isReadOnly}
        variant={variant}
      />
    </div>
  );
};
