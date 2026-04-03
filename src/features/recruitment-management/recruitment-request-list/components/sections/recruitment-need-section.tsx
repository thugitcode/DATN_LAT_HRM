import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormArea } from '@/components/form-fields/form-area';
import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { NAMESPACES } from '@/i18n/constants';

interface RecruitmentNeedSectionProps {
  isReadOnly?: boolean;
  variant?: 'flat' | 'bordered' | 'faded' | 'underlined';
}

export const RecruitmentNeedSection = ({ isReadOnly, variant }: RecruitmentNeedSectionProps) => {
  const { control } = useFormContext();
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
      <h3 className="text-lg font-medium text-[#11181C] tracking-wider">
        {t('form.sections.recruitment_need')}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <FormNumberInput
          control={control}
          name="quantity"
          label={t('form.fields.quantity')}
          isRequired
          placeholder={t('form.placeholders.enter_quantity')}
          allowNegative={false}
          decimalScale={0}
          readOnly={isReadOnly}
          variant={variant}
        />

        <FormDatePicker
          control={control}
          name="requiredDate"
          label={t('form.fields.required_date')}
          isReadOnly={isReadOnly}
          variant={variant}
        />
      </div>

      <FormArea
        control={control}
        name="reason"
        label={t('form.fields.reason')}
        placeholder={t('form.placeholders.enter_reason')}
        minRows={3}
        readOnly={isReadOnly}
        variant={variant}
      />
    </div>
  );
};
