import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { NAMESPACES } from '@/i18n/constants';

interface SalaryBudgetSectionProps {
  isReadOnly?: boolean;
  variant?: 'flat' | 'bordered' | 'faded' | 'underlined';
}

export const SalaryBudgetSection = ({ isReadOnly, variant }: SalaryBudgetSectionProps) => {
  const { control } = useFormContext();
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
      <h3 className="text-lg font-medium text-[#11181C] tracking-wider">
        {t('form.sections.salary_budget')}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <FormNumberInput
          control={control}
          name="salaryFrom"
          label={t('form.fields.salary_expected')}
          isRequired
          placeholder={t('form.placeholders.from')}
          allowNegative={false}
          readOnly={isReadOnly}
          variant={variant}
        />

        <FormNumberInput
          control={control}
          name="salaryTo"
          label={t('form.fields.salary_expected')}
          classNames={{ label: "text-transparent! text-base leading-4" }}
          placeholder={t('form.placeholders.to')}
          allowNegative={false}
          readOnly={isReadOnly}
          variant={variant}
        />
      </div>
    </div>
  );
};
