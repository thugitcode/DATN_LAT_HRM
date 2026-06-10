import { Button, Switch } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormAutocomplete } from '@/components/form-fields/form-autocomplete';
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { FormSelect } from '@/components/form-fields/form-select';
import { NAMESPACES } from '@/i18n/constants';
import { icons } from '@/lib/icons';
import { allowanceQueryOptions } from '@/services/query-options/allowance.query';
import { AllowanceType } from '@/types/allowance.type';

const SALARY_TYPE_OPTIONS = [
  { key: 'NET', label: 'NET' },
  { key: 'GROSS', label: 'GROSS' },
];

export function ProbationSalarySection() {
  const { control } = useFormContext();
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  const { data: allowanceData } = useQuery(
    allowanceQueryOptions.list({ type: AllowanceType.ALLOWANCE }),
  );

  const allAllowanceOptions =
    allowanceData?.data.map((item) => ({
      key: item.id,
      label: item?.value ? item.name + ' - ' + item?.value : item.name,
    })) ?? [];

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'allowanceIds',
  });

  const selectedAllowances = useWatch({ control, name: 'allowanceIds' }) as { allowanceId: string }[] | undefined;

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

      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <span className="text-base font-normal leading-4 text-[#52525B]">
            {t('probation.form.fields.allowance')}
          </span>
        </div>

        {fields.map((field, index) => {
          const currentId = selectedAllowances?.[index]?.allowanceId;
          const selectedOtherIds = new Set(
            selectedAllowances
              ?.filter((_, i) => i !== index)
              .map((a) => a.allowanceId)
              .filter(Boolean),
          );
          const filteredOptions = allAllowanceOptions.filter(
            (opt) => !selectedOtherIds.has(opt.key) || opt.key === currentId,
          );
          return (
          <div key={field.id} className="flex items-center gap-2">
            <div className="flex-1">
              <FormAutocomplete
                control={control}
                name={`allowanceIds.${index}.allowanceId` as never}
                label=""
                options={filteredOptions}
              />
            </div>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onPress={() => remove(index)}
              className='mt-2'
            >
              <icons.trash color="red" />
            </Button>
          </div>
          );
        })}
        <Button
          size="sm"
          color="primary"
          startContent={icons.plus}
          onPress={() => append({ allowanceId: '' })}
          className='w-fit mt-2'
        >
          {t('probation.form.actions.add_allowance')}
        </Button>
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
