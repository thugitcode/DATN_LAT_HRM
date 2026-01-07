import { useQuery } from "@tanstack/react-query";
import { getAllStaffsQueryOptions } from "@/query-options/user.option";

import type { SelectOptionsItemTypes, UseOptions } from "@/types";
import { getUserFullName } from "@/lib/utils";

export const useStaffOptions: UseOptions<SelectOptionsItemTypes["staff"]> = () => {
  const { data } = useQuery(getAllStaffsQueryOptions({ page: 1, limit: 25, filters: {} }));

  return {
    options:
      data?.data.map((item) => ({
        label: getUserFullName(item),
        value: item.ID,
        item,
      })) ?? [],
  };
};
