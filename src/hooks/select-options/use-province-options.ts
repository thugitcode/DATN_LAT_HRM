import type { SelectOptionsItemTypes, UseOptions } from "@/types";
import provinces from "@/assets/data/province.json";

import provinceCis from "@/assets/data/ward-cis.json"

export const useProvinceOptions: UseOptions<SelectOptionsItemTypes["province"]> = () => {
  return {
    options: provinceCis.map((item) => ({
      label: item.name,
      value: item.province_code,
    })),
  };
};
