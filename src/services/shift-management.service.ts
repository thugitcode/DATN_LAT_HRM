import { DEFAULT_PAGINATION } from '@/query-options/constants';

import type { StaffSchedule } from '@/types/shift-management.type';
import type { StaffParams } from '@/types/staff.type';
import { hrmInstance } from '@/lib/axios';

import { BaseApiService } from './base-api.service';

class ShiftManagementService extends BaseApiService<StaffSchedule, StaffParams> {
  constructor() {
    super(hrmInstance, '/work-schedule');
  }

  async getAll(params?: StaffParams) {
    return super.getAll({
      ...DEFAULT_PAGINATION,
      ...params,
    });
  }

  async getById(id: string | number) {
    return super.getById(id);
  }

  async create(data: Partial<StaffSchedule>) {
    const response = await hrmInstance.post('/work-schedule/range', data);
    return response.data;
  }

  async update(id: string | number, data: Partial<StaffSchedule>) {
    return super.update(id, data);
  }

  async delete(id: string | number) {
    return super.delete(id);
  }
}

export const shiftManagementService = new ShiftManagementService();
