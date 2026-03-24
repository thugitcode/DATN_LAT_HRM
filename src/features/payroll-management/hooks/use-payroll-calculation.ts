import { payrollCalculationOptions } from "@/services/query-options/payroll-management/payroll-calculation";
import type { RequestsParams } from "@/types/global.type";
import { useQuery } from "@tanstack/react-query";

export function usePayrollCalculationList(params?: RequestsParams) {
    return useQuery(payrollCalculationOptions.list(params));
}

export function usePayrollCalculationDetail(id: string) {
    return useQuery(payrollCalculationOptions.detail(id));
}

export function usePayrollCalculationResultDetail(id: string) {
    return useQuery(payrollCalculationOptions.resultDetails(id));
}

