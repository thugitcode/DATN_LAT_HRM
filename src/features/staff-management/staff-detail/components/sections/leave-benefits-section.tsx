// sections/LeaveBenefitsSection.tsx
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { IconBeach } from '@tabler/icons-react';
import { FormCheckboxGroup } from '@/components/form-fields/form-checkbox-group';


export const LeaveBenefitsSection: FC = () => {
    const { control, formState: { isSubmitting } } = useFormContext();

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
                <IconBeach size={20} className="text-[#11181C]" />
                <h3 className="text-[15px] font-bold text-[#11181C]">Nghỉ phép và phúc lợi</h3>
            </div>

            <div className="flex flex-col gap-4">
                <FormCheckboxGroup
                    control={control}
                    name="salary.leaveQuotaIds"
                    disabled={isSubmitting}
                    options={[
                        { value: 'P1', label: 'Nghỉ phép năm' },
                        { value: 'P2', label: 'Nghỉ ngày đặc biệt' },
                        { value: 'P3', label: 'Nghỉ sinh nhật' },
                    ]}
                />
            </div>
        </div>
    );
};