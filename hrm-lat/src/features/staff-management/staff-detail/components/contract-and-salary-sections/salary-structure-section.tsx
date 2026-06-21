// sections/SalaryStructureSection.tsx
import { FormLabel } from '@/components/form-fields/form-label';
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { useControlMode } from '@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle';
import { NAMESPACES } from '@/i18n/constants';
import { icons } from '@/lib/icons';
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from '@heroui/react';
import { IconChevronDown } from '@tabler/icons-react';
import type { FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';


export const SalaryStructureSection: FC<{ forceReadOnly?: boolean }> = ({ forceReadOnly = false }) => {
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
    const { control, setValue, formState: { isSubmitting, errors }, getValues } = useFormContext();
    const { isView } = useControlMode()
    const readOnly = forceReadOnly ? true : isView
    const variant = readOnly ? "underlined" : "flat"
    const mealAllowanceUnit = useWatch({ control, name: 'salary.mealAllowanceUnit' });

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
                {icons.moneyBag}
                <h3 className="text-[15px] font-bold text-[#11181C]">{t('salary_benefits.sections.salary_structure')}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Lương cơ bản - bắt buộc */}
                <FormNumberInput
                    control={control}
                    name="salary.basicSalary"
                    label={t('salary_benefits.basic_salary')}
                    placeholder={t('salary_benefits.placeholders.enter_basic')}
                    endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
                    isRequired
                    disabled={isSubmitting || isView}
                    variant={variant}
                    allowNegative={false}
                    decimalScale={0}
                />

                {/* Lương đóng BHXH - optional */}
                <FormNumberInput
                    control={control}
                    name="salary.insuranceSalary"
                    label={t('salary_benefits.insurance_salary')}
                    placeholder={t('salary_benefits.placeholders.enter_insurance')}
                    endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
                    disabled={isSubmitting || isView}
                    allowNegative={false}
                    decimalScale={0}
                    variant={variant}
                />

                {/* Phụ cấp trách nhiệm */}
                <FormNumberInput
                    control={control}
                    name="salary.responsibilityAllowance"
                    label={t('salary_benefits.responsibility_allowance')}
                    placeholder={t('salary_benefits.placeholders.enter')}
                    endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
                    disabled={isSubmitting || isView}
                    allowNegative={false}
                    decimalScale={0}
                    variant={variant}
                />

                {/* Phụ cấp chức vụ */}
                <FormNumberInput
                    control={control}
                    name="salary.positionAllowance"
                    label={t('salary_benefits.position_allowance')}
                    placeholder={t('salary_benefits.placeholders.enter')}
                    endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
                    disabled={isSubmitting || isView}
                    allowNegative={false}
                    decimalScale={0}
                    variant={variant}
                />

                {/* Phụ cấp độc hại, nguy hiểm */}
                <FormNumberInput
                    control={control}
                    name="salary.hazardAllowance"
                    label={t('salary_benefits.hazard_allowance')}
                    placeholder={t('salary_benefits.placeholders.enter')}
                    endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
                    disabled={isSubmitting || isView}
                    allowNegative={false}
                    decimalScale={0}
                    variant={variant}
                />

                {/* Phụ cấp ăn ca - có dropdown đơn vị */}
                <div className="flex flex-col gap-2">
                    <FormLabel label={t('salary_benefits.meal_allowance')} isError={errors?.salary?.hasOwnProperty('mealAllowance')} />

                    <div className="relative">
                        <FormNumberInput
                            control={control}
                            name="salary.mealAllowance"
                            placeholder={t('salary_benefits.placeholders.enter')}
                            decimalScale={0}
                            variant={variant}
                            endContent={
                                isView ? <span className='text-[#a1a1aa] text-sm'>{mealAllowanceUnit === 'DAY' ? t('salary_benefits.units.day') : t('salary_benefits.units.month')}</span> : <div className="flex items-center gap-2">
                                    <span className="text-[#a1a1aa] text-sm">VNĐ</span>
                                    <Dropdown>
                                        <DropdownTrigger>
                                            <Button
                                                variant="bordered"
                                                size="sm"
                                                className="h-8 min-w-21.25 border-[#E4E4E7] text-sm text-[#71717A] px-3 rounded-lg bg-white"
                                                endContent={<IconChevronDown size={14} />}
                                                isDisabled={isSubmitting}
                                            >
                                                {mealAllowanceUnit === 'DAY' ? t('salary_benefits.units.day') : t('salary_benefits.units.month')}
                                            </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu
                                            disallowEmptySelection
                                            selectionMode="single"
                                            selectedKeys={new Set([mealAllowanceUnit || 'DAY'])}
                                            onSelectionChange={(keys) => {
                                                const unit = Array.from(keys)[0] as string;
                                                setValue('salary.mealAllowanceUnit', unit);
                                            }}
                                        >
                                            <DropdownItem key="DAY">{t('salary_benefits.units.day')}</DropdownItem>
                                            <DropdownItem key="MONTH">{t('salary_benefits.units.month')}</DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </div>
                            }
                            allowNegative={false}
                            disabled={isSubmitting || isView}
                        />
                    </div>
                </div>

                {/* Phụ cấp xăng xe */}
                <FormNumberInput
                    control={control}
                    name="salary.fuelAllowance"
                    label={t('salary_benefits.fuel_allowance')}
                    placeholder={t('salary_benefits.placeholders.enter')}
                    endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
                    disabled={isSubmitting || isView}
                    allowNegative={false}
                    decimalScale={0}
                    variant={variant}
                />

                {/* Phụ cấp điện thoại */}
                <FormNumberInput
                    control={control}
                    name="salary.phoneAllowance"
                    label={t('salary_benefits.phone_allowance')}
                    placeholder={t('salary_benefits.placeholders.enter')}
                    endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
                    disabled={isSubmitting || isView}
                    allowNegative={false}
                    decimalScale={0}
                    variant={variant}
                />

                {/* Phụ cấp công tác */}
                <FormNumberInput
                    control={control}
                    name="salary.businessTripAllowance"
                    label={t('salary_benefits.business_trip_allowance')}
                    placeholder={t('salary_benefits.placeholders.enter')}
                    endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
                    disabled={isSubmitting || isView}
                    allowNegative={false}
                    decimalScale={0}
                    variant={variant}
                />

                {/* Phụ cấp khác */}
                <FormNumberInput
                    control={control}
                    name="salary.otherAllowance"
                    label={t('salary_benefits.other_allowance')}
                    placeholder={t('salary_benefits.placeholders.enter')}
                    endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
                    disabled={isSubmitting || isView}
                    allowNegative={false}
                    decimalScale={0}
                    variant={variant}
                />
            </div>
        </div>
    );
};