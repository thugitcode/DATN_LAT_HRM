import type { SelectOptionsItemTypes, UseOptions } from '@/types';
import { SubscriptionPricingType } from '@/types/subscription.type';

export const useSubscriptionPricingTypeOptions: UseOptions<
  SelectOptionsItemTypes['subscriptionPricingType']
> = () => {
  return {
    options: [
      { label: 'Gói bản quyền vĩnh viễn', value: SubscriptionPricingType.VINH_VIEN },
      { label: 'Gói thuê bao', value: SubscriptionPricingType.THUE_BAO },
    ],
  };
};
