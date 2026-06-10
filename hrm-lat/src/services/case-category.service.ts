import { DEFAULT_PAGINATION } from '@/query-options/constants';

import type { CaseCategory } from '@/types/case-category.type';
import type { StaffParams } from '@/types/staff.type';
import { hrmInstance } from '@/lib/axios';

import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from './constants/endpoints';

class CaseCategoryService extends BaseApiService<CaseCategory, StaffParams> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.SHIFT_TEMPLATE);
  }

  async getAll(params?: StaffParams) {
    return super.getAll({
      ...DEFAULT_PAGINATION,
      ...params,
    });
  }
}

export const caseCategoryService = new CaseCategoryService();
