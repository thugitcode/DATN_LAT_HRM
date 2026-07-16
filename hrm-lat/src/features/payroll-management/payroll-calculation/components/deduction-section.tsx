"use client";

import { NAMESPACES } from "@/i18n/constants";
import { icons } from "@/lib/icons";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { SalaryData } from "../../types/payroll-caculation.type";
import { CardHeader } from "./card-header";


interface DeductionSectionProps {
    data: SalaryData;
}

interface DeductionRowProps {
    label: string;
    percentage?: string;
    value: number;
    showFormula?: boolean;
    formulaLabel: string;
    formatCurrency: (amount: number) => string;
    note?: string;
}

export function DeductionRow({ label, percentage, value, showFormula, formulaLabel, formatCurrency, note }: DeductionRowProps) {
    return (
        <div className="grid grid-cols-3 justify-between py-2.5 border-b border-gray-100 last:border-0">
            <div className="flex-1">
                <p className="text-sm text-gray-700">
                    {label}
                    {percentage && <span className="text-gray-400 ml-1">({percentage})</span>}
                </p>
                {note && <p className="text-xs text-red-400">{note}</p>}
            </div>
            <div className="flex justify-center items-start">
                {showFormula && (
                    <span className="text-[14px] text-[#52525B] text-center">
                        {formulaLabel}
                    </span>
                )}
            </div>
            <span className="text-sm font-medium text-gray-900 min-w-[100px] text-right">
                {formatCurrency(value)}
            </span>
        </div>
    );
}

export const DeductionSection = ({ data }: { data: any }) => {
    const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);

    // Cấu hình các loại bảo hiểm để map tự động
    const insuranceConfigs = [
        { key: 'socialInsurance', label: t('payrollCalculation.detail.socialInsurance'), percentage: '8%', formulaKey: 'socialInsuranceFormula' },
        { key: 'healthInsurance', label: t('payrollCalculation.detail.healthInsurance'), percentage: '1.5%', formulaKey: 'healthInsuranceFormula' },
        { key: 'unemploymentInsurance', label: t('payrollCalculation.detail.unemploymentInsurance'), percentage: '1%', formulaKey: 'unemploymentInsuranceFormula' },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <CardHeader icon={icons.bill} title={t("payrollCalculation.detail.deductionTitle")} value={data.deductionAmount || data.totalDeduction} />

            <div className="px-4 py-2">
                {/* Render các dòng bảo hiểm cố định */}
                {insuranceConfigs.map((item) => (
                    <DeductionRow
                        key={item.key}
                        label={item.label}
                        percentage={item.percentage}
                        value={data[item.key]}
                        showFormula={!!data[item.formulaKey]}
                        formulaLabel={data[item.formulaKey] || t("payrollCalculation.detail.formula")}
                        formatCurrency={formatCurrency}
                    />
                ))}

                {/* Thuế và Công đoàn */}
                <DeductionRow
                    label={t("payrollCalculation.detail.unionFee")}
                    value={data.unionFee}
                    showFormula={!!data.unionFeeFormula}
                    formulaLabel={data.unionFeeFormula || t("payrollCalculation.detail.formula")}
                    formatCurrency={formatCurrency}
                />
                <DeductionRow
                    label={t("payrollCalculation.detail.personalIncomeTax")}
                    value={data.personalIncomeTax}
                    showFormula={!!data.personalIncomeTaxFormula}
                    formulaLabel={data.personalIncomeTaxFormula || t("payrollCalculation.detail.formula")}
                    formatCurrency={formatCurrency}
                />

                {/* Xử lý phạt vi phạm */}
                {data.violationPenalty > 0 && (
                    <DeductionRow
                        label={t("payrollCalculation.detail.violationPenalty")}
                        value={data.violationPenalty}
                        formulaLabel={t("payrollCalculation.detail.formula")}
                        formatCurrency={formatCurrency}
                        note={data.violationDetails}
                    />
                )}
            </div>
        </div>
    );
};