
import { SalaryHeader } from "./salary-header";
import { BasicIncomeSection } from "./basic-income-section";
import { AllowanceSection } from "./allowance-section";
import { NetIncomeSection } from "./net-income-section";
import type { SalaryData } from "../../types/payroll-caculation.type";
import { DeductionSection } from "./deduction-section";
import { SalarySummary } from "./salary-summary";

interface SalarySlipProps {
    data: SalaryData;
}

export function SalarySlip({ data }: SalarySlipProps) {
    return (
        <div className="overflow-auto h-[calc(100vh-190px)] ">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column - Main Sections */}
                <div className="lg:col-span-2 space-y-4 p-6 rounded-2xl bg-white">
                    <BasicIncomeSection data={data} />
                    <AllowanceSection data={data} />
                    <DeductionSection data={data} />
                    <NetIncomeSection data={data} />
                </div>

                {/* Right Column - Summary */}
                <div className="lg:col-span-1">
                    <SalarySummary data={data} />
                </div>
            </div>
        </div>
    );
}
