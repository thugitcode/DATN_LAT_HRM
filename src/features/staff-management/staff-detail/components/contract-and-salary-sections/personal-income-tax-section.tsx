// sections/PersonalIncomeTaxSection.tsx
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { IconReceiptTax } from '@tabler/icons-react';
import { FormCheckbox } from '@/components/form-fields/form-checkbox';
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { useControlMode } from '@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle';

export const PersonalIncomeTaxSection: FC = () => {
    const { control, watch, formState: { isSubmitting } } = useFormContext();
    const { isView } = useControlMode()
    const variant = isView ? "underlined" : "flat"
    const hasFamilyDeduction = watch('salary.hasFamilyDeduction');
    const hasPersonalIncomeTax = watch('salary.hasPersonalIncomeTax');

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
                <IconReceiptTax size={20} className="text-[#11181C]" />
                <h3 className="text-[15px] font-bold text-[#11181C]">Thuế TNCN</h3>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-2">
                {/* Giảm trừ gia cảnh */}
                <div className="flex flex-col gap-2">
                    <FormCheckbox
                        control={control}
                        name="salary.hasFamilyDeduction"
                        label="Giảm trừ gia cảnh"
                        disabled={isSubmitting || isView}
                    />

                    <FormNumberInput
                        control={control}
                        name="salary.dependentsCount"
                        label="Số người phụ thuộc"
                        placeholder="Nhập số người"
                        disabled={isSubmitting || isView || !hasFamilyDeduction}
                        isRequired={hasFamilyDeduction}
                        variant={variant}
                    />
                </div>

                {/* Thuế TNCN: Mặc định tick. Với trường hợp hợp đồng thủ việc, học việc, chuyên gia hợp tác, mặc định là 10%. Với hợp đồng nhân viên chính thức, lấy dữ liệu theo cơ chế lương để áp dụng mức đóng thuế tương ứng. Không thể chỉnh sửa. */}
                {/* Thuế TNCN */}
                <div className="flex flex-col gap-2">
                    <FormCheckbox
                        control={control}
                        name="salary.hasPersonalIncomeTax"
                        label="Thuế TNCN"
                        disabled={isSubmitting || isView}
                    />

                    <FormNumberInput
                        control={control}
                        name="salary.personalIncomeTaxRate"
                        label="Tỷ lệ (%)"
                        placeholder="Nhập tỷ lệ"
                        endContent={<span className="text-[#a1a1aa] text-sm">%</span>}
                        disabled={isSubmitting || isView || !hasPersonalIncomeTax}
                        variant={variant}
                        isRequired={hasPersonalIncomeTax}
                    // Validate %: decimalScale={2}, min={0}, max={100}
                    // fixedDecimalScale
                    // allowNegative={false}
                    />
                </div>
            </div>
        </div>
    );
};