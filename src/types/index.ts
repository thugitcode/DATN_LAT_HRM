import type {
  Shift,
  ShiftManagementParams,
  ShiftManagementResponse,
  StaffSchedule,
} from './shift-management.type';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  pagination: PaginationMeta | null;
  metadata: Record<string, unknown> | null;
  message: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface QueryOptionsListResponse<T, M = unknown> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
  meta: M;
}

type FormSelectOptions<T = unknown> = {
  value: string;
  label: string;
  item: T;
}[];

export type {
  Shift,
  StaffSchedule,
  PaginationMeta,
  ApiResponse,
  ShiftManagementResponse,
  ShiftManagementParams,
  PaginationParams,
  FormSelectOptions,
};
