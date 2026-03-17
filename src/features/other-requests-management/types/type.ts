import type { CategoryGeneralRequest } from './generate-request.type';

export interface OtherRequestsManagementParams {
  page?: number;
  limit?: number;
  getAll?: boolean;
  type?: string;
  status?: string;
  search?: string;
  month?: string;
  departmentIds?: string;
  roomIds?: string;
  category?: CategoryGeneralRequest;

  [key: string]: unknown;
}

export enum OtherStatusEnum {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}
