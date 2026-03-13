// sections/InsuranceAndUnionSection.tsx
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { IconShieldCheck } from '@tabler/icons-react';
import { FormCheckbox } from '@/components/form-fields/form-checkbox';
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { useControlMode } from '@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle';

export const InsuranceAndUnionSection: FC = () => {
  const { control, watch, formState: { isSubmitting } } = useFormContext();

  const { isView } = useControlMode()
  const variant = isView ? "underlined" : "flat"

  // Watch để disable/enable input tương ứng
  const hasHealthInsurance = watch('salary.hasHealthInsurance');
  const hasSocialInsurance = watch('salary.hasSocialInsurance');
  const hasUnemploymentInsurance = watch('salary.hasUnemploymentInsurance');
  const hasUnionFee = watch('salary.hasUnionFee');

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-5">
      <div className="flex items-center gap-2 mb-1">
        <IconShieldCheck size={20} className="text-[#11181C]" />
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
    </div>
  );
};