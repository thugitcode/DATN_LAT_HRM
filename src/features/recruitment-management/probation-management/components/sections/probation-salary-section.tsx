import { Switch } from '@heroui/react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { FormSelect } from '@/components/form-fields/form-select';
import { NAMESPACES } from '@/i18n/constants';
import { icons } from '@/lib/icons';

const SALARY_TYPE_OPTIONS = [
  { key: 'NET', label: 'NET' },
  { key: 'GROSS', label: 'GROSS' },
];

export function ProbationSalarySection() {
  const { control } = useFormContext();
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
      <h3 className="text-base flex items-center font-semibold text-[#11181C] gap-3">
        {icons.moneyBag}
        {t('probation.form.sections.salary')}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <FormNumberInput
          control={control}
          name="basicSalary"
          label={t('probation.form.fields.basic_salary')}

        />

        <FormSelect
          control={control}
          name="salaryType"
          label={t('probation.form.fields.salary_type')}

          isRequired
          options={SALARY_TYPE_OPTIONS}
        />
      </div>

      <div className="flex items-center gap-8 pt-1">
        <Controller
          name="hasHealthInsurance"
          control={control}
          render={({ field }) => (
            <Switch
              isSelected={field.value ?? false}
              onValueChange={field.onChange}
              size="sm"
            >
              <span className="text-sm text-[#11181C]">
                {t('probation.form.fields.health_insurance')}
              </span>
            </Switch>
          )}
        />

        <Controller
          name="hasSocialInsurance"
          control={control}
          render={({ field }) => (
            <Switch
              isSelected={field.value ?? false}
              onValueChange={field.onChange}
              size="sm"
            >
              <span className="text-sm text-[#11181C]">
                {t('probation.form.fields.social_insurance')}
              </span>
            </Switch>
          )}
        />

        <Controller
          name="hasUnemploymentInsurance"
          control={control}
          render={({ field }) => (
            <Switch
              isSelected={field.value ?? false}
              onValueChange={field.onChange}
              size="sm"
            >
              <span className="text-sm text-[#11181C]">
                {t('probation.form.fields.unemployment_insurance')}
              </span>
            </Switch>
          )}
        />
      </div>
    </div>
  );
}
