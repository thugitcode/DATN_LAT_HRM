import { shiftDetailsQueryOptions } from "@/services/query-options/shift-details";
import type { DetailsTimeSheetQueryParams } from "@/types/shift-details.type";
import { useQuery } from "@tanstack/react-query";

export function useDetailsTimeSheetList(params?: DetailsTimeSheetQueryParams) {
  return useQuery(shiftDetailsQueryOptions.list(params));
}