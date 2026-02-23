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

export type {
  Shift,
  StaffSchedule,
  PaginationMeta,
  ApiResponse,
  ShiftManagementResponse,
  ShiftManagementParams,
  PaginationParams,
};
