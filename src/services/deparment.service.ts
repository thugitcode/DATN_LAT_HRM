import { DEFAULT_PAGINATION } from '@/query-options/constants';

import type { PaginationParams } from '@/types';
import type { Department } from '@/types/deparment.type';
import { hrmInstance } from '@/lib/axios';

import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from './constants/endpoints';

class DepartmentService extends BaseApiService<Department, PaginationParams> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.DEPARTMENT);
  }

  async getAll(params?: PaginationParams) {
    return super.getAll({ ...DEFAULT_PAGINATION, ...params });
  }
}

export const departmentService = new DepartmentService();
