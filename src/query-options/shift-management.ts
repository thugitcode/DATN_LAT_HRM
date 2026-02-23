import { QueryClient, queryOptions, type UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import type {
  ApiResponse,
  Shift,
  ShiftManagementParams,
  ShiftManagementResponse,
  StaffSchedule,
} from '@/types';
import { hrmInstance } from '@/lib/axios';

const SHIFT_MANAGEMENT_QUERY_KEY = ['shift-management'] as const;

const DEFAULT_STALE_TIME = 3 * 60 * 1000;
const DEFAULT_CACHE_TIME = 10 * 60 * 1000;

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
} as const;

export const parseTimeString = (timeStr: string): Date => {
  const [hours = 0, minutes = 0, seconds = 0] = timeStr.split(':').map(Number) as [
    number,
    number,
    number,
  ];

  const date = new Date();
  date.setHours(hours, minutes, seconds, 0);
  return date;
};

export const formatShiftTime = (shift: Shift): string => {
  const start = shift.startTime.substring(0, 5);
  const end = shift.endTime.substring(0, 5);
  return `${start} - ${end}`;
};

export const calculateShiftHours = (shift: Shift): number => {
  const start = parseTimeString(shift.startTime);
  const end = parseTimeString(shift.endTime);
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
};

export const getDayName = (dayOfWeek: number): string => {
  const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const index = dayOfWeek === 0 ? 0 : dayOfWeek % 7;
  return days[index] ?? '';
};

const fetchWorkSchedule = async (
  params?: ShiftManagementParams,
): Promise<ShiftManagementResponse> => {
  try {
    const queryParams = {
      ...DEFAULT_PAGINATION,
      ...params,
    };

    const response = await hrmInstance.get<ApiResponse<StaffSchedule[]>>('/work-schedule', {
      params: queryParams,
      timeout: 15000,
    });

    const { data, pagination, message, statusCode } = response.data;

    if (statusCode !== 200) {
      throw new Error(message || 'Failed to fetch work schedule');
    }

    if (!pagination) {
      throw new Error('Invalid response: missing pagination data');
    }

    return {
      schedules: data || [],
      pagination,
      message,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data?.message || error.message;
      const statusCode = error.response?.status;

      if (statusCode === 401) {
        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      }
      if (statusCode === 403) {
        throw new Error('Bạn không có quyền truy cập dữ liệu này.');
      }
      if (statusCode === 404) {
        throw new Error('Không tìm thấy dữ liệu lịch làm việc.');
      }
      if (statusCode && statusCode >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau.');
      }

      throw new Error(`Lỗi tải lịch làm việc: ${errorMessage}`);
    }

    throw new Error('Có lỗi xảy ra khi tải dữ liệu');
  }
};

export const getShiftManagementQueryOptions = (
  params?: ShiftManagementParams,
  options?: Partial<UseQueryOptions<ShiftManagementResponse, Error>>,
) => {
  return queryOptions<ShiftManagementResponse, Error>({
    queryKey: params ? [...SHIFT_MANAGEMENT_QUERY_KEY, params] : SHIFT_MANAGEMENT_QUERY_KEY,

    queryFn: () => fetchWorkSchedule(params),

    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_CACHE_TIME,

    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,

    retry: (failureCount, error) => {
      if (error.message.includes('không có quyền') || error.message.includes('đăng nhập')) {
        return false;
      }

      return failureCount < 3;
    },

    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    select: options?.select,

    ...options,
  });
};

export const useShiftManagementQuery = (
  params?: ShiftManagementParams,
  options?: Partial<UseQueryOptions<ShiftManagementResponse, Error>>,
) => {
  return getShiftManagementQueryOptions(params, options);
};

export const invalidateShiftManagement = async (queryClient: QueryClient) => {
  return queryClient.invalidateQueries({
    queryKey: SHIFT_MANAGEMENT_QUERY_KEY,
  });
};

export const prefetchShiftManagement = async (
  queryClient: QueryClient,
  params?: ShiftManagementParams,
) => {
  return queryClient.prefetchQuery(getShiftManagementQueryOptions(params));
};

export const setShiftManagementData = (
  queryClient: QueryClient,
  data: ShiftManagementResponse,
  params?: ShiftManagementParams,
) => {
  const queryKey = params ? [...SHIFT_MANAGEMENT_QUERY_KEY, params] : SHIFT_MANAGEMENT_QUERY_KEY;

  queryClient.setQueryData(queryKey, data);
};

export const getShiftManagementData = (
  queryClient: QueryClient,
  params?: ShiftManagementParams,
): ShiftManagementResponse | undefined => {
  const queryKey = params ? [...SHIFT_MANAGEMENT_QUERY_KEY, params] : SHIFT_MANAGEMENT_QUERY_KEY;

  return queryClient.getQueryData<ShiftManagementResponse>(queryKey);
};

export const groupSchedulesByDepartment = (
  schedules: StaffSchedule[],
): Map<string, StaffSchedule[]> => {
  return schedules.reduce((acc, schedule) => {
    const deptId = schedule.staff.departmentId;
    if (!acc.has(deptId)) {
      acc.set(deptId, []);
    }
    acc.get(deptId)!.push(schedule);
    return acc;
  }, new Map<string, StaffSchedule[]>());
};

export const getScheduleDates = (schedules: StaffSchedule[]): string[] => {
  const dates = new Set<string>();
  schedules.forEach(({ schedules: daySchedules }) => {
    daySchedules.forEach(({ date }) => dates.add(date));
  });
  return Array.from(dates).sort();
};

export const calculateTotalHours = (schedule: StaffSchedule): number => {
  return schedule.schedules.reduce((total, day) => {
    const dayHours = day.shifts.reduce((sum, shift) => {
      return sum + calculateShiftHours(shift);
    }, 0);
    return total + dayHours;
  }, 0);
};
