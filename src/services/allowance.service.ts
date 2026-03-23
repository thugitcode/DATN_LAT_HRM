import { hrmInstance } from '@/lib/axios';

import { BaseApiService } from './base-api.service';
import type { AllowanceList } from '@/types/global.type';
import type { PaginationParams } from '@/types';

class AllowanceService extends BaseApiService<
  AllowanceList,
  Partial<AllowanceList>,
  Partial<AllowanceList>,
  PaginationParams
> {
  constructor() {
    super(hrmInstance, '/allowance');
  }

  async getAll(params?: PaginationParams) {
    return super.getAll(params);
  }
}

export const allowanceService = new AllowanceService();
