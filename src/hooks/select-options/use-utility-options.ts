import type { SelectOptionsItemTypes, UseOptions } from "@/types";
import utilities from "@/assets/data/utility.json";

export const useUtilityOptions: UseOptions<SelectOptionsItemTypes["utility"]> = () => {
  return {
    options: utilities.map((item) => ({
      label: item.TEN_TIEN_ICH,
      value: item.MA_TIEN_ICH,
    })),
  };
};
