// import { notifications, type NotificationData } from '@mantine/notifications';
import clsx, { type ClassValue } from 'clsx';

import type { FormFieldProps } from '@/types';
import dayjs from '@/lib/dayjs';

import { PERSIST_WHITELIST } from './constants';
import { idbPersister } from './idb-persister';
import { logger } from './logger';

export const DISABLE_AUTH = true;

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function cn(...classes: ClassValue[]) {
  return clsx(classes);
}

export function formatPhone(phone: string | null) {
  if (!phone) return '';
  const areaCode = phone?.substring(0, 4);
  const firstPart = phone?.substring(4, 7);
  const secondPart = phone?.substring(7, 10);

  return `${areaCode} ${firstPart} ${secondPart}`;
}

export function convertSecondsToMmSs(seconds: SecondsString | number) {
  const totalSeconds = typeof seconds === 'string' ? parseInt(seconds, 10) : seconds;

  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return '00:00';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  // Nếu có giờ thì format HH:mm:ss, không thì mm:ss
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatFullTime(time: string | Date | null) {
  if (!time) return '';
  return dayjs(time).format('DD/MM/YYYY HH:mm:ss');
}

export function formatTimeRevert(time: string | Date | null | undefined) {
  if (!time) return '';
  return dayjs(time).format('HH:mm DD/MM/YYYY ');
}

export function convertSecondsToFullDate(seconds: SecondsString | number) {
  const totalSeconds = typeof seconds === 'string' ? parseInt(seconds, 10) : seconds;
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return '';
  }
  return dayjs.unix(totalSeconds).format('DD/MM/YYYY HH:mm:ss');
}

export function formatDate(date?: string | null) {
  if (!date) return '';
  return dayjs(date).format('DD/MM/YYYY');
}

export function convertDateToISO(value: string | Date, anchor?: 'start' | 'end') {
  let date = dayjs(value);

  if (anchor === 'start') {
    date = date.startOf('day');
  } else if (anchor === 'end') {
    date = date.endOf('day');
  }

  return date.toISOString();
}

export function getDaysSinceUpdate(updatedAt: string): number {
  const now = dayjs();
  const updateTime = dayjs(updatedAt);
  return now.diff(updateTime, 'day');
}

export function getFormFieldProps({ formProps }: FormFieldProps) {
  return formProps
    ? {
        value: formProps.state.value,
        checked: formProps.state.value,
        onBlur: formProps.handleBlur,
        error: formProps.state.meta.errors
          .map((error: unknown) => {
            if (typeof error === 'string') return error;
            if (error && typeof error === 'object') {
              const err = error as { message?: unknown };
              if (typeof err.message === 'string') return err.message;
            }
            return 'Vui long kiểm tra lại';
          })
          .filter(Boolean)
          .join(', '),
      }
    : {};
}

// export const noti = {
//   success: (message?: string, config: Omit<NotificationData, 'message'> = {}) => {
//     notifications.show({
//       message: message || 'Thao tác thành công',
//       color: 'green',
//       position: 'top-right',
//       ...config,
//     });
//   },
//   error: (message?: string, config: Omit<NotificationData, 'message'> = {}) => {
//     notifications.show({
//       message: message || 'Thao tác thất bại, vui lòng thử lại',
//       color: 'red',
//       position: 'top-right',
//       ...config,
//     });
//   },
// };

export function formatPrice(price: string | number | undefined) {
  if (!price) return '0';
  if (typeof price === 'string' && isNaN(Number(price))) return '0';
  return new Intl.NumberFormat('en-US').format(Number(price));
}

/**
 * Kiểm tra xem một query có nên được persist không
 * Dựa vào meta.persist hoặc queryKey đầu tiên có trong whitelist không
 */
export function isPersistableQuery(query: {
  meta?: Record<string, unknown>;
  queryKey: readonly unknown[];
}): boolean {
  // Kiểm tra meta.persist
  if (query.meta?.persist === true) {
    return true;
  }

  // Kiểm tra queryKey đầu tiên có trong whitelist không
  const firstKey = query.queryKey[0];
  if (typeof firstKey === 'string' && PERSIST_WHITELIST.has(firstKey)) {
    return true;
  }

  // Mặc định không persist
  return false;
}

/**
 * Xóa toàn bộ persisted cache từ IndexedDB
 * @returns Promise<void>
 */
export async function clearPersistedCache(): Promise<void> {
  try {
    await idbPersister.removeClient();
    logger.info('✅ Persisted cache cleared successfully');
  } catch (error) {
    console.error('❌ Failed to clear persisted cache:', error);
    throw error;
  }
}

/**
 * Xóa cả persisted cache (IndexedDB) và in-memory cache
 * @param queryClient - QueryClient instance từ useQueryClient()
 * @returns Promise<void>
 */
export async function clearAllCache(queryClient: { clear: () => void }): Promise<void> {
  try {
    // 1. Xóa persisted cache từ IndexedDB
    await clearPersistedCache();

    // 2. Xóa in-memory cache
    queryClient.clear();

    logger.info('✅ All cache cleared successfully');
  } catch (error) {
    console.error('❌ Failed to clear all cache:', error);
    throw error;
  }
}

export function getBirthYearFromIso(iso?: IsoString | null) {
  if (!iso) return '';
  return dayjs(iso).format('YYYY');
}

export function getHourOptions(
  startHour?: string | null,
  endHour?: string | null,
  step: number = 30,
) {
  const options: string[] = [];

  // Validate format HH:mm using regex
  const timeFormatRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;

  // Return empty array if startHour or endHour is invalid
  if (
    !startHour ||
    !endHour ||
    !timeFormatRegex.test(startHour) ||
    !timeFormatRegex.test(endHour)
  ) {
    return [];
  }

  // Parse hours and minutes
  const [startH, startM] = startHour.split(':').map(Number);
  const [endH, endM] = endHour.split(':').map(Number);

  if (startH === undefined || startM === undefined || endH === undefined || endM === undefined) {
    return [];
  }

  // Create dayjs objects for comparison
  const startTime = dayjs().hour(startH).minute(startM).second(0);
  const endTime = dayjs().hour(endH).minute(endM).second(0);

  // Return empty array if endHour < startHour
  if (endTime.isBefore(startTime) || endTime.isSame(startTime)) {
    return [];
  }

  // Generate all time slots from 00:00 to 23:30 (or end of day)
  let currentTime = dayjs().hour(0).minute(0).second(0);
  const endOfDay = dayjs().hour(23).minute(59).second(59);

  while (currentTime.isBefore(endOfDay)) {
    const slotStart = currentTime.format('HH:mm');
    const slotEnd = currentTime.add(step, 'minutes').format('HH:mm');

    const timeRange = `${slotStart} - ${slotEnd}`;

    // Only include slots that fall within the startHour and endHour range
    const slotStartTime = currentTime;
    const slotEndTime = currentTime.add(step, 'minutes');

    // Check if slot overlaps with the allowed range
    if (
      (slotStartTime.isAfter(startTime) || slotStartTime.isSame(startTime)) &&
      slotEndTime.isBefore(endTime)
    ) {
      options.push(timeRange);
    }

    currentTime = currentTime.add(step, 'minutes');
  }

  return options;
}

export function filterHourOptionsAfterNow(options: string[]) {
  const now = dayjs();

  return options.filter((timeRange) => {
    // Parse time range format "HH:mm - HH:mm"
    const slotStart = timeRange.split(' - ')[0];

    if (!slotStart) {
      return false;
    }

    const [hour, minute] = slotStart.split(':').map(Number);

    if (!hour || !minute) {
      return false;
    }

    // Create dayjs object for slot start time
    const slotStartTime = dayjs().hour(hour).minute(minute).second(0);

    // Only include slots that are after current time
    return slotStartTime.isAfter(now);
  });
}

export function convertDateToUTC(date?: string | Date | null) {
  if (!date) return dayjs().utc().toISOString();
  return dayjs(date).utc().toISOString();
}

export function convertUTCToLocal(utcDate?: string | Date | null) {
  if (!utcDate) return null;
  // Convert from UTC to local timezone (already configured as Asia/Ho_Chi_Minh in dayjs.ts)
  return dayjs.utc(utcDate).local().toISOString();
}

export function randomUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const formatTime = (time: string | undefined) => {
  if (!time) return '--:--';
  return time.substring(0, 5);
};

export function calculateWorkingHours(
  checkIn: string,
  checkOut: string,
  breakMinutes: number
) {
  const [inHour, inMin] = checkIn.split(":").map(Number);
  const [outHour, outMin] = checkOut.split(":").map(Number);

  const checkInMinutes = (inHour ?? 0) * 60 + (inMin ?? 0);
  const checkOutMinutes = (outHour ?? 0) * 60 + (outMin ?? 0);

  const totalMinutes = checkOutMinutes - checkInMinutes - breakMinutes;

  return +(totalMinutes / 60).toFixed(2);
}

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  convertCompHours?: boolean; // có quy đổi giờ bù không
  compHourRate?: number; // tỷ lệ quy đổi (vd: 1h OT = 1.5h bù)
}

export function calculateCompHours(
  totalWorkHours: number,
  standardHours: number,
  convertRate: number
) {
  if (totalWorkHours <= standardHours) return 0

  const overtime = totalWorkHours - standardHours

  return overtime * convertRate
}

export function formatDateVN(d: string | Date) {
  const date = dayjs(d)
  const weekdays = ["Chủ nhật","Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7"]
  return `${weekdays[date.day()]}, ngày ${date.format("DD/MM/YYYY")}`
}