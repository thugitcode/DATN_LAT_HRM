export interface SummaryFinalize {
  month?: string; // 2026-04
  inputs: {
    attendance: string;
    revenue: number;
    kpiPoint: number;
    otherIncomeCount: number;
  };
  costs: {
    totalGrossSalary: number;
    totalBonus: number;
    totalPenalty: number;
    estimatedTotalPay: number;
  };
}
