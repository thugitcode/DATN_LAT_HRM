// sections/LeaveBenefitsSection.tsx
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { icons } from '@/lib/icons';
import { useLeaveQuotaOptions } from '@/hooks/options/use-leave-quota-options';
import { FormCheckboxGroup } from '@/components/form-fields/form-checkbox-group';
import { useControlMode } from '@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle';

export const LeaveBenefitsSection: FC = () => {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();
  const { isView } = useControlMode();

  const { options } = useLeaveQuotaOptions();

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        {icons.holiday}
        <h3 className="text-[15px] font-bold text-[#11181C]">Nghỉ phép và phúc lợi</h3>
      </div>

      <div className="flex flex-col gap-4">
        <FormCheckboxGroup
          control={control}
          name="salary.leaveQuotaIds"
          disabled={isSubmitting || isView}
          options={options}
          className="grid grid-cols-3"
        />
      </div>
    </div>
  );
};
