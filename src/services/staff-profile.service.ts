import { DEFAULT_PAGINATION } from '@/query-options/constants';

import type { PaginationParams } from '@/types';
import type { IStaffProfile } from '@/types/staff-profile.type';
import { hrmInstance } from '@/lib/axios';

import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from './constants/endpoints';

class StaffProfileService extends BaseApiService<IStaffProfile, Partial<IStaffProfile>, Partial<IStaffProfile>, PaginationParams> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.STAFF_PROFILE);
  }

  async getAll(params?: PaginationParams) {
    return super.getAll({ ...DEFAULT_PAGINATION, ...params });
  }
  
  async create(data: Partial<IStaffProfile>) {    
    return super.create(data);
  }

  async update(id: string | number, data: Partial<IStaffProfile>) {
    return super.update(id, data);
  }
}

export const staffProfileService = new StaffProfileService();
