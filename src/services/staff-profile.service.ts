
import { hrmInstance } from '@/lib/axios';
import type { PaginationParams } from '@/types';
import type { IPayloadStaffDocument, IStaffDocument } from '@/types/staff-profile.type';

import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from './constants/endpoints';

class StaffProfileService extends BaseApiService<IStaffDocument, Partial<IStaffDocument>, Partial<IStaffDocument>, PaginationParams> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.STAFF_PROFILE);
  }

  // async getAll(params?: PaginationParams) {
  //   return super.getAll({ ...DEFAULT_PAGINATION, ...params });
  // }

  async getAll(params?: PaginationParams & { id: string }) {
    return this.request(async () => {
      const res = await this.instance.get(`/staff-document/staff/${params?.id}`, { params });
      return res.data;
    });
  }

  async create(data: Partial<IPayloadStaffDocument> & { staffId: string }) {
    return this.request(async () => {
      const res = await this.instance.post(`/staff-document/staff/${data?.staffId}`, data);
      return res.data;
    });
  }

  async update(id: string | number, data: Partial<IStaffDocument>) {
    return super.update(id, data);
  }
}

export const staffProfileService = new StaffProfileService();
