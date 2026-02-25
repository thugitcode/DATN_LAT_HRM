import { DEFAULT_PAGINATION } from '@/query-options/constants';

import type { PaginationParams } from '@/types';
import type { Room } from '@/types/room.type';
import { hrmInstance } from '@/lib/axios';

import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from './constants/endpoints';

class RoomService extends BaseApiService<Room, PaginationParams> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.ROOM);
  }

  async getAll(params?: PaginationParams) {
    return super.getAll({ ...DEFAULT_PAGINATION, ...params });
  }
}

export const roomService = new RoomService();
