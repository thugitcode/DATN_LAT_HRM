// sections/InsuranceAndUnionSection.tsx
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { IconShieldCheck } from '@tabler/icons-react';
import { FormCheckbox } from '@/components/form-fields/form-checkbox';
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { useControlMode } from '@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle';
import { icons } from '@/lib/icons';
import { FormInput } from '@/components/form-fields/form-input';

export const InsuranceAndUnionSection: FC = () => {
  const { control, watch, formState: { isSubmitting } } = useFormContext();

  const { isView } = useControlMode()
  const variant = isView ? "underlined" : "flat"

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
        <h3 className="text-[15px] font-bold text-[#11181C]">Bảo hiểm và công đoàn</h3>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 1. Bảo hiểm y tế */}
        <div className="flex flex-col gap-2">
          <FormCheckbox
            control={control}
            name="salary.hasHealthInsurance"
            label="Bảo hiểm y tế"
            disabled={isSubmitting || isView}
          />

          <FormNumberInput
            control={control}
            name="salary.healthInsuranceRate"
            label="Tỷ lệ đóng"
            placeholder="Nhập tỷ lệ"
            endContent={<span className="text-[#a1a1aa] text-sm">%</span>}
            isRequired={hasHealthInsurance}
            disabled={isSubmitting || isView || !hasHealthInsurance}
            variant={variant}
          />
        </div>

        {/* 2. Bảo hiểm xã hội */}
        <div className="flex flex-col gap-2">
          <FormCheckbox
            control={control}
            name="salary.hasSocialInsurance"
            label="Bảo hiểm xã hội"
            disabled={isSubmitting || isView}
          />

          <FormNumberInput
            control={control}
            name="salary.socialInsuranceRate"
            label="Tỷ lệ đóng"
            placeholder="Nhập tỷ lệ"
            endContent={<span className="text-[#a1a1aa] text-sm">%</span>}
            isRequired={hasSocialInsurance}
            disabled={isSubmitting || isView || !hasSocialInsurance}
            variant={variant}
          />
        </div>

        {/* 3. Bảo hiểm thất nghiệp */}
        <div className="flex flex-col gap-2">
          <FormCheckbox
            control={control}
            name="salary.hasUnemploymentInsurance"
            label="Bảo hiểm thất nghiệp"
            disabled={isSubmitting || isView}
          />

          <FormNumberInput
            control={control}
            name="salary.unemploymentInsuranceRate"
            label="Tỷ lệ đóng"
            placeholder="Nhập tỷ lệ"
            endContent={<span className="text-[#a1a1aa] text-sm">%</span>}
            isRequired={hasUnemploymentInsurance}
            disabled={isSubmitting || isView || !hasUnemploymentInsurance}
            variant={variant}
          />
        </div>

        {/* 4. Công đoàn */}
        <div className="flex flex-col gap-2">
          <FormCheckbox
            control={control}
            name="salary.hasUnionFee"
            label="Công đoàn"
            disabled={isSubmitting || isView}
          />

          <FormNumberInput
            control={control}
            name="salary.unionFee"
            label="Mức đóng"
            placeholder="Nhập mức đóng"
            endContent={<span className="text-[#a1a1aa] text-sm min-w-12.5 text-right">
              {Number(watch("salary.unionFee") || 0) < 100 ? "%" : "VNĐ"}
            </span>}
            isRequired={hasUnionFee}
            disabled={isSubmitting || isView || !hasUnionFee}
            variant={variant}
          // Nếu muốn format tiền Việt Nam: thousandSeparator=".", decimalScale={0}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <FormCheckbox
          control={control}
          name="salary.hasHealthCareInsurance"
          label="Bảo hiểm sức khỏe"
          disabled={isSubmitting}
        />

        <FormInput
          control={control}
          name="salary.healthCareInsuranceCompany"
          label="Tên công ty bảo hiểm"
          placeholder="Nhập tên công ty"
          disabled={isSubmitting || !hasHealthCareInsurance}
          isRequired={hasHealthCareInsurance}
        />

        <div className="grid grid-cols-2 gap-4 mt-2">
          <FormNumberInput
            control={control}
            name="salary.healthCareInsuranceBenefit"
            label="Mức hưởng"
            placeholder="Nhập mức hưởng"
            endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
            disabled={isSubmitting || !hasHealthCareInsurance}
            isRequired={hasHealthCareInsurance}
          // Gợi ý: thousandSeparator=".", decimalScale={0} nếu là số nguyên VNĐ
          />

          <FormNumberInput
            control={control}
            name="salary.healthCareInsuranceRate"
            label="Mức đóng (%)"
            placeholder="Nhập tỷ lệ"
            endContent={<span className="text-[#a1a1aa] text-sm">%</span>}
            disabled={isSubmitting || !hasHealthCareInsurance}
            isRequired={hasHealthCareInsurance}
          // Gợi ý: decimalScale={2}, fixedDecimalScale nếu muốn 2 chữ số thập phân
          />
        </div>
      </div>
    </div>
  );
};