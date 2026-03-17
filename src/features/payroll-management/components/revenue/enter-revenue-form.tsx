import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { NAMESPACES } from '@/i18n/constants';
import { IconPercentage } from '@tabler/icons-react';
import { type FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const EnterRevenueForm: FC = () => {
    const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
    const { control, setValue } = useFormContext();

    // Watch giá trị để tính toán tỉ lệ đạt tự động
    const target = useWatch({ control, name: 'target' });
    const actual = useWatch({ control, name: 'actual' });

    // Tính toán tỉ lệ đạt: (Thực đạt / Chỉ tiêu) * 100
    const achievementRate = target > 0 ? ((actual ?? 1) / (target ?? 1)) * 100 : 0;

    return (
        <div className="bg-white rounded-2xl border border-[#E4E4E7] overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-[#E4E4E7]/50 px-4 py-2 border-b border-[#E4E4E7]">
                <h3 className="text-sm font-bold text-[#11181C]">
                    {t('revenue.form.title')}
                </h3>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-4">
                {/* Chọn Tháng */}
                <FormDatePicker
                    control={control}
                    name="month"
                    label={t('revenue.form.fields.month')}
                // showMonthPicker // Giả định component của bạn hỗ trợ chỉ chọn tháng
                // format="MM/YYYY"
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormNumberInput
                        control={control}
                        name="target"
                        label={t('revenue.form.fields.target')}
                        placeholder={t('revenue.form.placeholders.input')}
                        isRequired
                    />

                    <FormNumberInput
                        control={control}
                        name="actual"
                        label={t('revenue.form.fields.actual')}
                        placeholder={t('revenue.form.placeholders.input')}
                        isRequired
                    />
                </div>

                {/* Tỉ lệ đạt */}
                <div className="flex items-center gap-2 mt-2">
                    <div className="w-8 h-8 rounded-full bg-[#E4E4E7] flex items-center justify-center">
                        <IconPercentage size={16} className="text-[#71717A]" />
                    </div>
                    <span className="text-sm font-medium text-[#71717A]">
                        {t('revenue.form.fields.achievement_rate')}:
                    </span>
                    <span className="text-sm font-bold text-[#11181C]">
                        {achievementRate.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%
                    </span>
                </div>
            </div>
        </div>
    );
};