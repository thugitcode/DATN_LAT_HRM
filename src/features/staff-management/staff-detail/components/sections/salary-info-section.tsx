// sections/SalaryInfoSection.tsx
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { IconCurrencyDollar } from '@tabler/icons-react';
import { FormSelect } from '@/components/form-fields/form-select';
import { FormNumberInput } from '@/components/form-fields/form-number-input';


export const SalaryInfoSection: FC = () => {
  const { control, formState: { isSubmitting }, watch } = useFormContext();

  const salaryTypeOptions = [
    { key: 'GROSS', label: 'Lương Gross' },
    { key: 'NET', label: 'Lương Net' },
  ];
const salaryType = watch("salary.salaryType")

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <IconCurrencyDollar size={20} className="text-[#11181C]" />
        <h3 className="text-[15px] font-bold text-[#11181C]">Thông tin lương</h3>
      </div>

      <div className="flex flex-col gap-6">
        <FormSelect
          control={control}
          name="salary.salaryType"
          label="Loại lương"
          placeholder="Chọn"
          isRequired
          options={salaryTypeOptions}
          disabled={isSubmitting}
        />

        <div className="grid grid-cols-2 gap-x-4">
          <FormNumberInput
            control={control}
            name="salary.netSalary"
            label="Lương net"
            placeholder="Nhập"
            endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
            disabled={true}
          />

          <FormNumberInput
            control={control}
            name="salary.grossSalary"
            label="Lương gross"
            placeholder="Nhập"
            endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
            disabled={true}
          />
        </div>
      </div>
    </div>
  );
};