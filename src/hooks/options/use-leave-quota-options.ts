import { leaveQuotaService } from '@/services/leave-quota.service';

import { Status, type RequestsParams } from '@/types/global.type';
import type { LeaveQuota } from '@/types/leave-quota.type';

import { createCrudHooks } from '../use-crud-query';

export const useLeaveQuotaOptions = () => {
  const { useList } = createCrudHooks<LeaveQuota, RequestsParams>(
    ['leave-quota'],
    leaveQuotaService,
  );

  const { data } = useList({
    status: Status.ACTIVE,
    getAll: true,
  });

  return {
    options:
      data?.data?.map((item) => ({
        key: item.id,
        label: item.name,
      })) ?? [],
  };
};
