import type { SelectOptionsItemTypes, UseOptions } from '@/types';
import { SubscriptionDuration } from '@/types/subscription.type';

export const useSubscriptionDurationOptions: UseOptions<
  SelectOptionsItemTypes['subscriptionDuration']
> = () => {
  return {
    options: [
      { label: 'Tháng', value: SubscriptionDuration.THANG },
      { label: 'Năm', value: SubscriptionDuration.NAM },
    ],
  };
};
