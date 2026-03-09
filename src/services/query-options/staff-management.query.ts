import { useMutation, useQuery, type UseMutationResult } from "@tanstack/react-query";
import { staffService } from "../staff.service";
import type { ApiResponse } from "@/types";
import type { SalaryFormValues } from "@/features/staff-management/salary-and-benefits/schemas";

export const useSalaryDetailsQuery = (
  id?: string,
) => {
  return useQuery({
    queryKey: ["salary-details", id],
    queryFn: () => staffService.getDetailsStaffSalary(id!),
    enabled: !!id,
  });
};

export const usePatchDetailsStaffSalary = (): UseMutationResult<
  ApiResponse<void>,
  Error,
  { id: string; payload: SalaryFormValues }
> => {
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      return await staffService.patchDetailsStaffSalary(id, payload);
    },
  });
};
