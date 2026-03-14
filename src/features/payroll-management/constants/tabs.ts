export const PAYROLL_TABS = [
  { key: 'data-summary', label: 'Dữ liệu chấm công' },
  { key: 'sales', label: 'Doanh số' },
  { key: 'kpi', label: 'KPI' },
  { key: 'other-income', label: 'Các khoản thu nhập khác' },
  { key: 'summary', label: 'Tổng hợp và chốt' },
] as const;

export type PayrollTabKey = (typeof PAYROLL_TABS)[number]['key'];
