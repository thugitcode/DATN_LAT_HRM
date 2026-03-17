// sections/SalaryStructureSection.tsx
import type { FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { IconCurrencyDollar, IconMoneybag } from '@tabler/icons-react';
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Button,
} from '@heroui/react';
import { IconChevronDown } from '@tabler/icons-react';
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { FormLabel } from '@/components/form-fields/form-label';
import { useControlMode } from '@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle';
import { icons } from '@/lib/icons';


export const SalaryStructureSection: FC = () => {
    const { control, setValue, formState: { isSubmitting, errors }, getValues } = useFormContext();
    const { isView } = useControlMode()
    const variant = isView ? "underlined" : "flat"
    const mealAllowanceUnit = useWatch({ control, name: 'salary.mealAllowanceUnit' });

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
                {icons.moneyBag}
                <h3 className="text-[15px] font-bold text-[#11181C]">Cấu trúc lương</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Lương cơ bản - bắt buộc */}
                <FormNumberInput
                    control={control}
                    name="salary.basicSalary"
                    label="Lương cơ bản"
                    placeholder="Nhập lương cơ bản"
                    endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
                    isRequired
                    disabled={isSubmitting || isView}
                    variant={variant}
                    allowNegative={false}
                />

                {/* Lương đóng BHXH - optional */}
                <FormNumberInput
                    control={control}
                    name="salary.insuranceSalary"
                    label="Lương đóng BHXH"
                    placeholder="Nhập lương đóng BHXH"
                    endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
                    disabled={isSubmitting || isView}
                    allowNegative={false}
                    variant={variant}
                />

                {/* Phụ cấp trách nhiệm */}
                <FormNumberInput
                    control={control}
                    name="salary.responsibilityAllowance"
                    label="Phụ cấp trách nhiệm"
                    placeholder="Nhập"
                    endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
                    disabled={isSubmitting || isView}
                    allowNegative={false}
                    variant={variant}
                />

                {/* Phụ cấp chức vụ */}
                <FormNumberInput
                    control={control}
                    name="salary.positionAllowance"
                    label="Phụ cấp chức vụ"
                    placeholder="Nhập"
                    endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
                    disabled={isSubmitting || isView}
                    allowNegative={false}
                    variant={variant}
                />

                {/* Phụ cấp độc hại, nguy hiểm */}
                <FormNumberInput
                    control={control}
                    name="salary.hazardAllowance"
                    label="Phụ cấp độc hại, nguy hiểm"
                    placeholder="Nhập"
                    endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
                    disabled={isSubmitting || isView}
                    allowNegative={false}
                    variant={variant}
                />

                {/* Phụ cấp ăn ca - có dropdown đơn vị */}
                <div className="flex flex-col gap-2">
                    <FormLabel label={"Phụ cấp ăn ca"} isRequired={true} isError={errors?.salary?.hasOwnProperty('mealAllowance')} />

                    <div className="relative">
                        <FormNumberInput
                            control={control}
                            name="salary.mealAllowance"
                            placeholder="Nhập"
                            isRequired
                            variant={variant}
                            endContent={
                                isView ? <span className='text-[#a1a1aa] text-sm'>{mealAllowanceUnit === 'DAY' ? 'Ngày' : 'Tháng'}</span> : <div className="flex items-center gap-2">
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
                                                {mealAllowanceUnit === 'DAY' ? 'Ngày' : 'Tháng'}
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
                                            <DropdownItem key="DAY">Ngày</DropdownItem>
                                            <DropdownItem key="MONTH">Tháng</DropdownItem>
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
                    label="Phụ cấp xăng xe"
                    placeholder="Nhập"
                    endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
                    disabled={isSubmitting || isView}
                    allowNegative={false}
                    variant={variant}
                />

                {/* Phụ cấp điện thoại */}
                <FormNumberInput
                    control={control}
                    name="salary.phoneAllowance"
                    label="Phụ cấp điện thoại"
                    placeholder="Nhập"
                    endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
                    disabled={isSubmitting || isView}
                    allowNegative={false}
                    variant={variant}
                />

                {/* Phụ cấp công tác */}
                <FormNumberInput
                    control={control}
                    name="salary.businessTripAllowance"
                    label="Phụ cấp công tác"
                    placeholder="Nhập"
                    endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
                    disabled={isSubmitting || isView}
                    allowNegative={false}
                    variant={variant}
                />

                {/* Phụ cấp khác */}
                <FormNumberInput
                    control={control}
                    name="salary.otherAllowance"
                    label="Phụ cấp khác"
                    placeholder="Nhập"
                    endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>}
                    disabled={isSubmitting || isView}
                    allowNegative={false}
                    variant={variant}
                />
            </div>
        </div>
    );
};