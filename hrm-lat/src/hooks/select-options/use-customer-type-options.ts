import type { SelectOptionsItemTypes, UseOptions } from "@/types";
import { CustomerType } from "@/types/customer.type";
import { CUSTOMER_TYPE_LABELS } from "@/lib/constants";

export const useCustomerTypeOptions: UseOptions<SelectOptionsItemTypes["customerType"]> = () => {
  return {
    options: [
      {
        value: CustomerType.THANH_VIEN,
        label: CUSTOMER_TYPE_LABELS[CustomerType.THANH_VIEN],
      },
      {
        value: CustomerType.DOI_TAC,
        label: CUSTOMER_TYPE_LABELS[CustomerType.DOI_TAC],
      },
    ],
  };
};
