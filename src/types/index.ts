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

// interface ApiResponse<T> {
//   statusCode: number;
//   data: T;
//   pagination: PaginationMeta | null;
//   metadata: Record<string, unknown> | null;
//   message: string;
// }
export interface IApiResponseShiftDivision<T, TMeta = Record<string, unknown>> {
  statusCode: number;
  data: {
    data: T[];
    shiftTypesCount: Record<string, number>;
    summary: Record<string, number>;
  };
  pagination: PaginationMeta | null;
  metadata: TMeta | null;
  message: string;
}
export interface IApiSalaryAndBenefitResponse<T, TMeta = Record<string, unknown>> {
  statusCode: number;
  data: {
    currentSummary: {
      currentSalary: number
      lastRaiseBy: string
      lastRaiseDate: string
      lastRaiseDelta: number
    },
    salary: T
  };
  pagination: PaginationMeta | null;
  metadata: TMeta | null;
  message: string;
}
interface ApiResponse<T, TMeta = Record<string, unknown>> {
  statusCode: number;
  data: T;
  pagination: PaginationMeta | null;
  metadata: TMeta | null;
  message: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  getAll?: boolean;
  departmentId?: string;
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

export interface IResponseFileUpload {
  key: string;
  size?: number;
  originalName?: string;
  mimetype?: string;
}
