import type { ApiResponse } from '@/types';
import type { Configuration } from '@/types/configuratiton.type';
import type { RequestsParams } from '@/types/global.type';
import type { ShiftTemplate } from '@/types/shift-template.type';
import { hrmInstance } from '@/lib/axios';

import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from './constants/endpoints';

class ConfigurationService extends BaseApiService<
  Configuration,
  Partial<ShiftTemplate>,
  Partial<ShiftTemplate>,
  RequestsParams
> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.CONFIGURATION);
  }

  // async getAll(params?: RequestsParams) {
  //   return super.getAll(params);
  // }

  async getList(params?: RequestsParams) {
    return this.request(async () => {
      const res = await hrmInstance.get<ApiResponse<Configuration>>(
        API_ENDPOINTS.HRM.CONFIGURATION,
      );
      return res.data;
    });
  }
}

export const configurationService = new ConfigurationService();
