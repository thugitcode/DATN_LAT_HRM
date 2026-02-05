import { TAB_KEYS, type TabItem } from '../types/index.type';

export const tabs: TabItem[] = [
  {
    label: 'Bảng công theo ca',
    key: TAB_KEYS.WORKSHEET_BY_SHIFT,
  },
  {
    label: 'Bảng công theo giờ',
    key: TAB_KEYS.HOURLY_PAYROLL,
  },
];
