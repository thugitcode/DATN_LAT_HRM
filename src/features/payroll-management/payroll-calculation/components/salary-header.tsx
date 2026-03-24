import { Avatar, Button, Chip } from "@heroui/react";
import type { SalaryData } from "../../types/payroll-caculation.type";
import { NAMESPACES } from "@/i18n/constants";
import { useTranslation } from "react-i18next";
import { IconChevronLeft, IconChevronRight, IconGlobe, IconHistory, IconPrinter } from "@tabler/icons-react";

interface SalaryHeaderProps {
    data: SalaryData;
    currentIndex: number;
    totalStaff: number;
}

export function SalaryHeader({ data, currentIndex, totalStaff }: SalaryHeaderProps) {
    const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
    const { t: tc } = useTranslation(NAMESPACES.COMMON);

    return (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Avatar
                        src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                        size="md"
                        className="border-2 border-blue-500"
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{data.staffName}</span>
                            <span className="text-gray-500 text-sm">| {data.staffCode}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-500">{data.departmentName}</span>
                            <Chip size="sm" color="success" variant="flat" className="text-xs">
                                {t("payrollCalculation.detail.working")}
                            </Chip>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Button isIconOnly size="sm" variant="flat" className="min-w-8 h-8">
                            <IconChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button isIconOnly size="sm" variant="flat" className="min-w-8 h-8">
                            <IconChevronRight className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-gray-600">
                            {currentIndex} / {totalStaff} {tc("staff")}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="flat"
                            isIconOnly
                            className="min-w-8 h-8"
                        >
                            <IconGlobe className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            startContent={<IconHistory className="w-4 h-4" />}
                        >
                            {t("payrollCalculation.detail.history")}
                        </Button>
                        <Button
                            size="sm"
                            color="primary"
                            startContent={<IconPrinter className="w-4 h-4" />}
                        >
                            {t("payrollCalculation.detail.print")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
