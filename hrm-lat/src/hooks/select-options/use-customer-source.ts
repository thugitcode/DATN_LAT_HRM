import { getAllSourceCustomersQueryOptions } from "@/query-options/source-customer.option";
import type { SelectOptionsItemTypes, UseOptions } from "@/types";
import { useCommonTable } from "../common/use-common-table";
import { useMemo } from "react";

export const useCustomerSourceOptions: UseOptions<
  SelectOptionsItemTypes["customerSource"]
> = () => {
  const { data } = useCommonTable({ queryOptions: getAllSourceCustomersQueryOptions });
  const options = useMemo(() =>
    (data ?? []).map((item) => ({
      value: String(item.ID),
      label: item.TEN_NGUON_KHACH,
    })),
  [data],
);
  return { options };
};
