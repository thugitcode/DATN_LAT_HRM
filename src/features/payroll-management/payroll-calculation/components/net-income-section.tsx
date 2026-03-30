import { useTranslation } from "react-i18next";
import type { SalaryData } from "../../types/payroll-caculation.type";
import { NAMESPACES } from "@/i18n/constants";
import { formatCurrency } from "@/lib/utils";
import { icons } from "@/lib/icons";


interface NetIncomeSectionProps {
    data: SalaryData;
}

export function NetIncomeSection({ data }: NetIncomeSectionProps) {
    const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);

    return (
        <div className="bg-[#E6F1FE] rounded-xl px-4 py-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#006FEE]">
                    {icons.moneyBag}
                    <span className="text-[#006FEE] font-medium text-lg leading-7">{t("payrollCalculation.detail.netIncomeTitle")}</span>
                </div>
                <span className="text-xl font-medium leading-7 text-[#006FEE]">
                    {formatCurrency(data.finalAmount)}
                </span>
            </div>
        </div>
    );
}
