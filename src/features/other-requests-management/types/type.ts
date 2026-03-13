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

  [key: string]: unknown;
}

export enum OtherStatusEnum {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}
