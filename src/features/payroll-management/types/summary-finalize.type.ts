export interface SummaryFinalize {
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
