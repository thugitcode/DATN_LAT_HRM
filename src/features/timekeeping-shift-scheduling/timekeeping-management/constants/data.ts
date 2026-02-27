import {
  AttendanceStatus,
  DetailedTimeSheetStatus,
  HourlyPayrollStatus,
  TAB_KEYS,
  type LegendItem,
  type ShiftCode,
  type TabItem,
} from '../types/index.type';

export const tabs: TabItem[] = [
  { label: 'Bảng công theo ca', key: TAB_KEYS.WORKSHEET_BY_SHIFT },
  { label: 'Bảng công theo giờ', key: TAB_KEYS.HOURLY_PAYROLL },
  { label: 'Bảng công chi tiết', key: TAB_KEYS.DETAILED_TIME_SHEET },
];

export const WORK_SHEET_LEGEND_ITEMS: LegendItem[] = [
  { status: AttendanceStatus.OnTime, label: 'Đúng giờ', color: '#3874B8' },
  { status: AttendanceStatus.Absent, label: 'Vắng mặt', color: '#9734EE' },
  { status: AttendanceStatus.Late, label: 'Đi muộn', color: '#D55829' },
  { status: AttendanceStatus.EarlyLeave, label: 'Về sớm', color: '#73C9C6' },
  { status: AttendanceStatus.LateAndEarly, label: 'Muộn & về sớm', color: '#E8873A' },
  { status: AttendanceStatus.Overtime, label: 'Công tác', color: '#F5AF24' },
  { status: AttendanceStatus.WorkFromHome, label: 'Làm tại nhà', color: '#9DCAFF' },
  { status: AttendanceStatus.ShortHours, label: 'Thiếu giờ', color: '#FF93B8' },
  { status: AttendanceStatus.MissingPunch, label: 'Quên chấm công', color: '#17C964' },
  { status: AttendanceStatus.PaidLeave, label: 'Nghỉ phép', color: '#A855F7' },
  { status: AttendanceStatus.DayOff, label: 'Ngày nghỉ', color: 'transparent', shape: 'ring' },
];

export const HOURLY_PAYROLL_LEGEND_ITEMS: LegendItem[] = [
  { status: HourlyPayrollStatus.FULL_HOURS, label: 'Đủ giờ', color: '#006FEE' },
  { status: HourlyPayrollStatus.SHORTAGE, label: 'Thiếu', color: '#F31260' },
  { status: HourlyPayrollStatus.OVERTIME, label: 'Thừa', color: '#52525B' },
  { status: HourlyPayrollStatus.OFF, label: 'Nghỉ', color: '#000000', shape: 'line' },
];

export const DETAILED_TIME_SHEET_LEGEND_ITEMS: LegendItem[] = [
  { status: DetailedTimeSheetStatus.M, label: 'Đi muộn', color: '#D55829' },
  { status: DetailedTimeSheetStatus.S, label: 'Về sớm', color: '#73C9C6' },
];

export enum DetailedTimeSheetColor {
  Late = '#D55829',
  Early = '#73C9C6',
}

export const CELL_W = 52;
export const PILL_INSET = 6;

export const STATUS_COLOR_MAP: Partial<Record<ShiftCode, string>> = Object.fromEntries(
  WORK_SHEET_LEGEND_ITEMS.filter((item) => item.color !== 'transparent').map((item) => [
    item.status as ShiftCode,
    item.color,
  ]),
);

// Những shift nào hiển thị dạng pill kéo dài (span > 1)
// Hiện tại chỉ "Đ" (OnTime) mới pill, còn lại hiển thị badge tròn
export const PILL_SHIFTS = new Set<ShiftCode>([AttendanceStatus.OnTime]);
