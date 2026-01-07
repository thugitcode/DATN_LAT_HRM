import type { SelectOptionsItemTypes, UseOptions } from "@/types";
import { CustomerStage,  } from '@/types/customer.type';
import { FILTER_STAGE_LABELS } from '@/lib/constants';

export const useFilterStatusOptions: UseOptions<
  SelectOptionsItemTypes["customerStatus"]
> = () => {
  return {
    options: [
      {
        value: CustomerStage.KHACH_HANG_TIEM_NANG,
        label: FILTER_STAGE_LABELS[CustomerStage.KHACH_HANG_TIEM_NANG],
      },
      {
        value: CustomerStage.DANG_CHAM_SOC,
        label: FILTER_STAGE_LABELS[CustomerStage.DANG_CHAM_SOC],
      },
      {
        value: CustomerStage.DANG_KY_HOP_DONG,
        label: FILTER_STAGE_LABELS[CustomerStage.DANG_KY_HOP_DONG],
      },

    ],
  };
};
