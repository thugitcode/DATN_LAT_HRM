export enum TAB_KEYS {
  WORKSHEET_BY_SHIFT = 'WORKSHEET_BY_SHIFT',
  HOURLY_PAYROLL = 'HOURLY_PAYROLL',
}

export interface TabItem {
  label: string;
  key: TAB_KEYS;
}
