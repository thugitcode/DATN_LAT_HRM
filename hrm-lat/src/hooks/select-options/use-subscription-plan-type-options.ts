import type { SelectOptionsItemTypes, UseOptions } from '@/types';
import { SubscriptionPlanType } from '@/types/subscription.type';
import { subscriptionPlanTypeLabel } from '@/lib/constants';

export const useSubscriptionPlanTypeOptions: UseOptions<
  SelectOptionsItemTypes['subscriptionPlanType']
> = () => {
  return {
    options: [
      {
        label: subscriptionPlanTypeLabel['TRAI_NGHIEM'],
        value: SubscriptionPlanType.TRAI_NGHIEM,
      },
      {
        label: subscriptionPlanTypeLabel['TIEU_CHUAN'],
        value: SubscriptionPlanType.TIEU_CHUAN,
      },
      {
        label: subscriptionPlanTypeLabel['TUY_CHINH'],
        value: SubscriptionPlanType.TUY_CHINH,
      },
    ],
  };
};
