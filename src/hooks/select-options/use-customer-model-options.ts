import type { SelectOptionsItemTypes, UseOptions } from "@/types";
import { CustomerModel } from "@/types/customer.type";
import { CUSTOMER_MODEL_LABELS } from "@/lib/constants";

export const useCustomerModelOptions: UseOptions<SelectOptionsItemTypes["customerModel"]> = () => {
  return {
    options: [
      {
        value: CustomerModel.MOT_PHONG_KHAM,
        label: CUSTOMER_MODEL_LABELS[CustomerModel.MOT_PHONG_KHAM],
      },
      {
        value: CustomerModel.CHUOI,
        label: CUSTOMER_MODEL_LABELS[CustomerModel.CHUOI],
      },
      {
        value: CustomerModel.HUB,
        label: CUSTOMER_MODEL_LABELS[CustomerModel.HUB],
      },
    ],
  };
};
