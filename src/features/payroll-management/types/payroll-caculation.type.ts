import type { Item } from "@/features/timekeeping-shift-scheduling/timekeeping-management/components/work-sheet-by-shift/department-room-info";

/**
 * Định nghĩa kỳ tính lương
 */
export interface PayrollPeriod {
    id: string;
    name: string;
    fromDate: string; // YYYY-MM-DD
    toDate: string;   // YYYY-MM-DD
    status: 'DRAFT' | 'FINALIZED' | string; // Có thể mở rộng thêm các status khác
    standardWorkingDays: number;
}

/**
 * Chi tiết lương và công của từng nhân viên
 */
export interface StaffPayroll {
    payrollResultId: string;
    staffId: string;
    staffCode: string;
    staffName: string;
    avatar: string | null;
    departments: Item[];
    rooms: Item[];
    position: 'STAFF' | 'HEAD_OF_DEPARTMENT' | 'MANAGER' | string;
    workDays: number;
    totalAttendance: number;
    actualWorkDays: number;
    paidLeave: number;
    overtimeHours: number;
    totalLateMinutes: number;
    totalEarlyMinutes: number;
    basicSalary: number;
    allowanceAmount: number;
    overtimeAmount: number;
    deductionAmount: number;
    netPay: number;
    totalGross: number;
    confirmationStatus: 'N/A' | 'PENDING' | 'CONFIRMED' | string;
}

/**
 * Thông tin phân trang
 */
export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

/**
 * Interface tổng thể phản hồi từ API
 */
export interface PayrollApiResponse {
    period: PayrollPeriod;
    data: StaffPayroll[];
    pagination: Pagination;
}

export interface SalaryData {
    staffName: string;
    staffCode: string;
    departmentName: string;
    monthLabel: string;
    fromDate: string;
    toDate: string;

    // Working days
    standardWorkingDays: number;
    actualWorkDays: number;
    paidLeave: number;
    unpaidLeave: number;
    totalWorkDays: number;

    // Leave info
    totalLeaveDays: number;
    usedLeaveDays: number;
    remainingLeaveDays: number;

    // Overtime
    totalOvertimeHours: number;
    overtimeAmount: number;
    compHoursUsed: number;
    compHoursRemaining: number;

    // Contract salary
    contractBasicSalary: number;
    contractHazardAllowance: number;
    contractSupportAllowance: number;
    contractTotalSalary: number;

    // Actual salary
    actualWorkSalary: number;
    onCallDays: number;
    onCallSalary: number;
    actualPositionAllowance: number;
    actualBasicSalaryByWork: number;

    // Allowances
    responsibilityAllowance: number;
    positionAllowance: number;
    hazardAllowance: number;
    mealAllowance: number;
    fuelAllowance: number;
    phoneAllowance: number;
    businessTripAllowance: number;
    otherAllowance: number;

    // Bonus & Performance
    performanceSalary: number;
    bonusAmount: number;
    otherIncomeAndOvertime: number;
    totalBeforeDeduction: number;

    // Violations
    violationPenalty: number;
    violationDetails: string;

    // Insurance
    insuranceBaseSalary: number;
    socialInsurance: number;
    healthInsurance: number;
    unemploymentInsurance: number;
    unionFee: number;

    // Tax
    selfDeduction: number;
    familyDeduction: number;
    taxExemptIncome: number;
    personalIncomeTax: number;

    // Totals
    totalDeduction: number;
    netIncome: number;
    prepaidPhase1: number;
    advancePayment: number;
    pensionFund1Percent: number;
    finalAmount: number;
}