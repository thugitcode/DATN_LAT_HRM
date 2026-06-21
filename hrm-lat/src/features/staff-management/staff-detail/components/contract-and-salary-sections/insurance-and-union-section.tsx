// sections/InsuranceAndUnionSection.tsx
import { FormCheckbox } from '@/components/form-fields/form-checkbox';
import { FormInput } from '@/components/form-fields/form-input';
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { useControlMode } from '@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle';
import { NAMESPACES } from '@/i18n/constants';
import { icons } from '@/lib/icons';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const InsuranceAndUnionSection: FC<{ forceReadOnly?: boolean }> = ({ forceReadOnly = false }) => {
  const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
  const { control, watch, formState: { isSubmitting } } = useFormContext();

  const { isView } = useControlMode()
  // Dùng forceReadOnly prop trực tiếp - không phụ thuộc store
  const readOnly = forceReadOnly
  const variant = readOnly ? "underlined" : "flat"

  // Watch để disable/enable input tương ứng
  const hasHealthInsurance = watch('salary.hasHealthInsurance');
  const hasSocialInsurance = watch('salary.hasSocialInsurance');
  const hasUnemploymentInsurance = watch('salary.hasUnemploymentInsurance');
  const hasUnionFee = watch('salary.hasUnionFee');
  const hasHealthCareInsurance = watch('salary.hasHealthCareInsurance');

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-5">
      <div className="flex items-center gap-2 mb-1">
        {icons.shieldUser}
        <h3 className="text-[15px] font-bold text-[#11181C]">{t('insurance_union.title')}</h3>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 1. Bảo hiểm y tế */}
        <div className="flex flex-col gap-2">
          <FormCheckbox
            control={control}
            name="salary.hasHealthInsurance"
            label={t('insurance_union.health_insurance')}
            disabled={isSubmitting || readOnly}
          />

          <FormNumberInput
            control={control}
            name="salary.healthInsuranceRate"
            label={t('insurance_union.contribution_rate')}
            placeholder={t('insurance_union.placeholders.enter_rate')}
            endContent={<span className="text-[#a1a1aa] text-sm">%</span>}
            isRequired={hasHealthInsurance}
            disabled={isSubmitting || readOnly || !hasHealthInsurance}
            variant={variant}
            allowNegative={false}
            max={100}
          />
        </div>

        {/* 2. Bảo hiểm xã hội */}
        <div className="flex flex-col gap-2">
          <FormCheckbox
            control={control}
            name="salary.hasSocialInsurance"
            label={t('insurance_union.social_insurance')}
            disabled={isSubmitting || readOnly}
          />

          <FormNumberInput
            control={control}
            name="salary.socialInsuranceRate"
            label={t('insurance_union.contribution_rate')}
            placeholder={t('insurance_union.placeholders.enter_rate')}
            endContent={<span className="text-[#a1a1aa] text-sm">%</span>}
            isRequired={hasSocialInsurance}
            disabled={isSubmitting || readOnly || !hasSocialInsurance}
            allowNegative={false}
            variant={variant}
            max={100}
          />
        </div>

        {/* 3. Bảo hiểm thất nghiệp */}
        <div className="flex flex-col gap-2">
          <FormCheckbox
            control={control}
            name="salary.hasUnemploymentInsurance"
            label={t('insurance_union.unemployment_insurance')}
            disabled={isSubmitting || readOnly}
          />

          <FormNumberInput
            control={control}
            name="salary.unemploymentInsuranceRate"
            label={t('insurance_union.contribution_rate')}
            placeholder={t('insurance_union.placeholders.enter_rate')}
            endContent={<span className="text-[#a1a1aa] text-sm">%</span>}
            isRequired={hasUnemploymentInsurance}
            disabled={isSubmitting || readOnly || !hasUnemploymentInsurance}
            allowNegative={false}
            variant={variant}
            max={100}
          />
        </div>

        {/* 4. Công đoàn */}
        <div className="flex flex-col gap-2">
          <FormCheckbox
            control={control}
            name="salary.hasUnionFee"
            label={t('insurance_union.union_fee')}
            disabled={isSubmitting || readOnly}
          />

          <FormNumberInput
            control={control}
            name="salary.unionFee"
            label={t('insurance_union.contribution_amount')}
            placeholder={t('insurance_union.placeholders.enter_amount')}
            endContent={<span className="text-[#a1a1aa] text-sm min-w-12.5 text-right">
              {Number(watch("salary.unionFee") || 0) < 100 ? "%" : "VNĐ"}
            </span>}
            isRequired={hasUnionFee}
            disabled={isSubmitting || readOnly || !hasUnionFee}
            variant={variant}
            allowNegative={false}
          // Nếu muốn format tiền Việt Nam: thousandSeparator=".", decimalScale={0}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <FormCheckbox
          control={control}
          name="salary.hasHealthCareInsurance"
          label={t('insurance_union.healthcare_insurance')}
          disabled={isSubmitting || readOnly}
        />

        <FormInput
          control={control}
          name="salary.healthCareInsuranceCompany"
          label={t('insurance_union.insurance_company')}
          placeholder={t('insurance_union.placeholders.enter_company')}
          disabled={isSubmitting || !hasHealthCareInsurance}
          isRequired={hasHealthCareInsurance}
          variant={variant}
        />

        <div className="grid grid-cols-2 gap-4 mt-2">
          <FormNumberInput
            control={control}
            name="salary.healthCareInsuranceBenefit"
            label={t('insurance_union.benefit_level')}
            placeholder={t('insurance_union.placeholders.enter_benefit')}
            endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
            disabled={isSubmitting || !hasHealthCareInsurance}
            allowNegative={false}
            isRequired={hasHealthCareInsurance}
            variant={variant}
          // Gợi ý: thousandSeparator=".", decimalScale={0} nếu là số nguyên VNĐ
          />

          <FormNumberInput
            control={control}
            name="salary.healthCareInsuranceRate"
            label={t('insurance_union.contribution_rate_percent')}
            placeholder={t('insurance_union.placeholders.enter_rate')}
            endContent={<span className="text-[#a1a1aa] text-sm">%</span>}
            disabled={isSubmitting || !hasHealthCareInsurance}
            allowNegative={false}
            isRequired={hasHealthCareInsurance}
            max={100}
            variant={variant}
          />
        </div>
      </div>
    </div>
  );
};