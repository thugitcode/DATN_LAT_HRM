import type { SelectOptionsItemTypes, UseOptions } from "@/types";
import hospitalLines from "@/assets/data/hospital-line.json";

export const useHospitalLineOptions: UseOptions<SelectOptionsItemTypes["hospitalLine"]> = () => {
  return {
    options: hospitalLines.map((item) => ({
      label: item.TEN_TUYEN_BV,
      value: item.MA_TUYEN_BV,
    })),
  };
};
