// sections/HealthCareInsuranceSection.tsx
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { IconHeartbeat } from '@tabler/icons-react';
import { FormCheckbox } from '@/components/form-fields/form-checkbox';
import { FormInput } from '@/components/form-fields/form-input';
import { FormNumberInput } from '@/components/form-fields/form-number-input';

export const HealthCareInsuranceSection: FC = () => {
  const { control, watch, formState: { isSubmitting } } = useFormContext();

  const hasHealthCareInsurance = watch('salary.hasHealthCareInsurance');

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <IconHeartbeat size={20} className="text-[#11181C]" />
        <h3 className="text-[15px] font-bold text-[#11181C]">Bảo hiểm sức khỏe</h3>
      </div>

      <div className="flex flex-col gap-4">
        <FormCheckbox
          control={control}
          name="salary.hasHealthCareInsurance"
          label="Sử dụng bảo hiểm sức khỏe"
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