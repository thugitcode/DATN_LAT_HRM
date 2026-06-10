export interface SalaryHistory {
  id: string;
  basicSalary: number; // Lương tính theo ngày công thực tế
  allowanceAmount: number; // Tổng phụ cấp
  overtimeAmount: number; // Tiền OT
  bonusAmount: number; // Thưởng thêm
  deductionAmount: number; // Các khoản trừ (đi muộn, vi phạm...)
  insuranceAmount: number; // Khấu trừ BHXH, YT, TN
  taxAmount: number; // Thuế TNCN
  netPay: number; // Thực lĩnh cuối cùng
  calculationDetails: unknown; // Lưu log chi tiết cách tính để giải trình
  isPaid: boolean;
  paidAt: Date;
  payrollPeriod: {
    name: string; // vd: Tháng 3/2026
    fromDate: Date;
    toDate: Date;
    standardWorkingDays: number; // Công chuẩn của tháng
    status: unknown;
    note: string;
  };
}
