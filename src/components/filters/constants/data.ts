import type { MonthOption } from '../types/type';

export const MONTHS: readonly MonthOption[] = [
  { key: '1', label: 'Tháng 1' },
  { key: '2', label: 'Tháng 2' },
  { key: '3', label: 'Tháng 3' },
  { key: '4', label: 'Tháng 4' },
  { key: '5', label: 'Tháng 5' },
  { key: '6', label: 'Tháng 6' },
  { key: '7', label: 'Tháng 7' },
  { key: '8', label: 'Tháng 8' },
  { key: '9', label: 'Tháng 9' },
  { key: '10', label: 'Tháng 10' },
  { key: '11', label: 'Tháng 11' },
  { key: '12', label: 'Tháng 12' },
] as const;

export const MONTH_NAMES: readonly string[] = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
] as const;
