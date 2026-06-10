// sections/SalaryInfoSection.tsx
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { FormSelect } from '@/components/form-fields/form-select';
import { useControlMode } from '@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle';
import { NAMESPACES } from '@/i18n/constants';
import { IconCoinFilled } from '@tabler/icons-react';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';


export const SalaryInfoSection: FC = () => {
  const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
  const { control, formState: { isSubmitting }, watch } = useFormContext();
  const { isView } = useControlMode()
  const variant = isView ? "underlined" : "flat"
  const salaryTypeOptions = [
    { key: 'GROSS', label: t('salary_benefits.options.gross') },
    { key: 'NET', label: t('salary_benefits.options.net') },
  ];
  const salaryType = watch("salary.salaryType")
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <IconCoinFilled size={20} className="text-[#11181C]" />
        <h3 className="text-[15px] font-bold text-[#11181C]">{t('salary_benefits.sections.salary_info')}</h3>
      </div>

      <div className="flex flex-col gap-6">
        <FormSelect
          control={control}
          name="salary.salaryType"
          label={t('salary_benefits.salary_type')}
          placeholder={t('salary_benefits.placeholders.select')}
          isRequired
          options={salaryTypeOptions}
          disabled={isSubmitting || isView}
          variant={variant}
        />

        <div className="grid grid-cols-2 gap-x-4">
          <FormNumberInput
            control={control}
            name="salary.netSalary"
            label={t('salary_benefits.salary_net')}
            placeholder={t('salary_benefits.placeholders.enter')}
            endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
            disabled={true}
            variant={variant}
          />

          <FormNumberInput
            control={control}
            name="salary.grossSalary"
            label={t('salary_benefits.salary_gross')}
            placeholder={t('salary_benefits.placeholders.enter')}
            endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
            disabled={true}
            variant={variant}
          />
        </div>
      </div>
    </div>
  );
};