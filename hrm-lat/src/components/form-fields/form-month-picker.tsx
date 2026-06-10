"use client"

import React, { useState, useMemo } from "react";
import {
    Button,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Divider,
    cn
} from "@heroui/react";
import { useController, type Control } from "react-hook-form";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { IconCalendarMonth, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { NAMESPACES } from "@/i18n/constants";
import { FormLabel } from "./form-label";

interface Props {
    name: string;
    control: Control<any>;
    label?: string;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    isRequired?: boolean;
}

export const FormMonthYearPicker = ({ name, control, label, className, placeholder, disabled, isRequired }: Props) => {
    const { t } = useTranslation(NAMESPACES.COMMON);
    const { field, fieldState } = useController({ name, control });
    const [isOpen, setIsOpen] = useState(false);

    const isInvalid = !!fieldState.error;
    const date = useMemo(() => (field.value ? dayjs(field.value) : dayjs()), [field.value]);
    const [viewYear, setViewYear] = useState(date.year());

    // Danh sách tháng i18n
    const months = useMemo(() =>
        Array.from({ length: 12 }, (_, i) => ({
            label: `${t('picker.month_prefix')}${(i + 1).toString().padStart(2, '0')}`,
            index: i
        }))
        , [t]);

    const handleSelectMonth = (monthIndex: number) => {
        const newDate = dayjs().year(viewYear).month(monthIndex).format("YYYY-MM");
        field.onChange(newDate);
        setIsOpen(false);
    };

    return (
        <div className={cn("flex flex-col", className)}>
            {/* Label đồng bộ UI FormInput */}
            {label && (
                <span className="pb-2 leading-4">
                    <FormLabel label={label} isRequired={isRequired} isError={isInvalid} />
                </span>
            )}

            <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-start">
                <PopoverTrigger>
                    <Button
                        isDisabled={disabled}
                        variant="flat"
                        disableAnimation // Bỏ hiệu ứng scale/zoom khi click
                        className={cn(
                            "justify-between text-left font-normal w-full text-black h-10 px-3 bg-[#F4F4F5] hover:bg-[#E4E4E7]",
                            "border-2 border-transparent transition-all scale-100!", // Force scale-100
                            isInvalid && "bg-[#F4F4F5] !text-[#F31260]"
                        )}
                    >
                        <span className={cn(!field.value && "text-default-400")}>
                            {field.value ? date.format("MM/YYYY") : (placeholder || t('picker.placeholder'))}
                        </span>
                        <IconCalendarMonth
                            size={18}
                            className={isInvalid ? "text-[#F31260]" : "text-[#52525B]"}
                        />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="p-3 w-[280px]">
                    <div className="flex flex-col w-full gap-4">
                        {/* Điều hướng Năm */}
                        <div className="flex items-center justify-between px-1">
                            <Button isIconOnly size="sm" variant="light" onPress={() => setViewYear(v => v - 1)}>
                                <IconChevronLeft size={18} />
                            </Button>
                            <span className="font-bold text-lg">
                                {t('picker.year', { year: viewYear })}
                            </span>
                            <Button isIconOnly size="sm" variant="light" onPress={() => setViewYear(v => v + 1)}>
                                <IconChevronRight size={18} />
                            </Button>
                        </div>

                        <Divider />

                        {/* Lưới chọn Tháng */}
                        <div className="grid grid-cols-3 gap-2">
                            {months.map((m) => {
                                const isSelected = field.value && date.month() === m.index && date.year() === viewYear;
                                return (
                                    <Button
                                        key={m.index}
                                        size="sm"
                                        variant={isSelected ? "solid" : "flat"}
                                        color={isSelected ? "primary" : "default"}
                                        className={cn(
                                            "min-w-0 h-10 font-medium",
                                            !isSelected && "bg-transparent hover:bg-default-100"
                                        )}
                                        onPress={() => handleSelectMonth(m.index)}
                                    >
                                        {m.label}
                                    </Button>
                                );
                            })}
                        </div>

                        <Divider />

                        <Button
                            size="sm"
                            variant="light"
                            color="primary"
                            className="font-semibold"
                            onPress={() => {
                                const now = dayjs().format("YYYY-MM");
                                field.onChange(now);
                                setViewYear(dayjs().year());
                                setIsOpen(false);
                            }}
                        >
                            {t('picker.current_month')}
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Error Message đồng bộ UI FormInput */}
            {isInvalid && (
                <span className="text-tiny text-[#F31260] px-1 pt-1">
                    {fieldState.error?.message}
                </span>
            )}
        </div>
    );
};