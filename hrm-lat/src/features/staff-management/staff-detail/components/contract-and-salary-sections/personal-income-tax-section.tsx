// sections/PersonalIncomeTaxSection.tsx
import { FormCheckbox } from '@/components/form-fields/form-checkbox';
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { useControlMode } from '@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle';
import { NAMESPACES } from '@/i18n/constants';
import { icons } from '@/lib/icons';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const PersonalIncomeTaxSection: FC<{ forceReadOnly?: boolean }> = ({ forceReadOnly = false }) => {
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
    const { control, watch, formState: { isSubmitting } } = useFormContext();
    const { isView } = useControlMode()
    // Dùng forceReadOnly prop trực tiếp - không phụ thuộc store
  const readOnly = forceReadOnly
    const variant = readOnly ? "underlined" : "flat"
    const hasFamilyDeduction = watch('salary.hasFamilyDeduction');
    const hasPersonalIncomeTax = watch('salary.hasPersonalIncomeTax');

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
                {icons.bill}
                <h3 className="text-[15px] font-bold text-[#11181C]">{t('salary_benefits.sections.tax')}</h3>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-2">
                {/* Giảm trừ gia cảnh */}
                <div className="flex flex-col gap-2">
                    <FormCheckbox
                        control={control}
                        name="salary.hasFamilyDeduction"
                        label={t('salary_benefits.family_deduction')}
                        disabled={isSubmitting || readOnly}
                    />

                    <FormNumberInput
                        control={control}
                        name="salary.dependentsCount"
                        label={t('salary_benefits.dependents_count')}
                        placeholder={t('salary_benefits.placeholders.enter_count')}
                        disabled={isSubmitting || readOnly || !hasFamilyDeduction}
                        isRequired={hasFamilyDeduction}
                        variant={variant}
                        allowNegative={false}
                    />
                </div>

                {/* Thuế TNCN: Mặc định tick. Với trường hợp hợp đồng thủ việc, học việc, chuyên gia hợp tác, mặc định là 10%. Với hợp đồng nhân viên chính thức, lấy dữ liệu theo cơ chế lương để áp dụng mức đóng thuế tương ứng. Không thể chỉnh sửa. */}
                {/* Thuế TNCN */}
                <div className="flex flex-col gap-2">
                    <FormCheckbox
                        control={control}
                        name="salary.hasPersonalIncomeTax"
                        label={t('salary_benefits.sections.tax')}
                        disabled={isSubmitting || readOnly}
                    />

                    <FormNumberInput
                        control={control}
                        name="salary.personalIncomeTaxRate"
                        label={t('salary_benefits.tax_rate')}
                        placeholder={t('salary_benefits.placeholders.enter_rate')}
                        endContent={<span className="text-[#a1a1aa] text-sm">%</span>}
                        disabled={isSubmitting || readOnly || !hasPersonalIncomeTax}
                        variant={variant}
                        isRequired={hasPersonalIncomeTax}
                        // Validate %: decimalScale={2}, 
                        min={0}
                        max={100}
                        // fixedDecimalScale
                        allowNegative={false}
                    />
                </div>
            </div>
        </div>
    );
};