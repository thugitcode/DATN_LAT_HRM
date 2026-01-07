import type { SelectOptionsItemTypes, UseOptions } from '@/types';
import { CUSTOMER_STATUS_OPTIONS } from '@/lib/constants';

export const useCustomerStatusOptions: UseOptions<
  SelectOptionsItemTypes['customerStatus']
> = () => {
  return {
    options: CUSTOMER_STATUS_OPTIONS,
  };
};
