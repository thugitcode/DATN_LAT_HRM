import { DEFAULT_PAGINATION } from '@/query-options/constants';

import type { CaseCategory } from '@/types/case-category.type';
import type { StaffParams } from '@/types/staff.type';
import { hrmInstance } from '@/lib/axios';

import { BaseApiService } from './base-api.service';

class CaseCategoryService extends BaseApiService<CaseCategory, StaffParams> {
  constructor() {
    super(hrmInstance, '/shift-template');
  }

  async getAll(params?: StaffParams) {
    return super.getAll({
      ...DEFAULT_PAGINATION,
      ...params,
    });
  }
}

export const caseCategoryService = new CaseCategoryService();
