import type { SelectOptionsItemTypes, SelectOptionsMetaTypes, UseOptions } from "@/types";
import wards from "@/assets/data/ward.json";

import wardsCis from "@/assets/data/ward-cis.json"

export const useWardOptions: UseOptions<
  SelectOptionsItemTypes["ward"],
  SelectOptionsMetaTypes["ward"]
> = (meta) => {
  const provinceCode = meta?.provinceCode;
  // const wardsByProvinceCode = wards[(provinceCode ?? "") as keyof typeof wards] ?? [];

  // console.log("wardsCis_____________", wardsCis)

  // return {
  //   options: wardsByProvinceCode.map((item) => ({
  //     label: item.TEN_PHUONG_XA,
  //     value: item.MA_PHUONG_XA,
  //   })),
  //   disabled: !provinceCode,
  // };



  const province = wardsCis.find(
    (p) => p.province_code === provinceCode
  );

   const wardsByProvince = province?.wards ?? [];


  return {
    options: wardsByProvince.map((ward) => ({
      label: ward.name,
      value: ward.ward_code,
    })),
    disabled: !provinceCode,
  };
};
