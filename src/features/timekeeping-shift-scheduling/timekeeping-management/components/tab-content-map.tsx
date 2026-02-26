import { TAB_KEYS } from '../types/index.type';
import { DetailedTimeSheet } from './detailed-time-sheet';
import { HourlyPayroll } from './hourly-payroll/hourly-payroll';
import { WorkSheetByShift } from './work-sheet-by-shift/work-sheet-by-shift';

export const TAB_CONTENT_MAP: Record<TAB_KEYS, React.ReactNode> = {
  [TAB_KEYS.WORKSHEET_BY_SHIFT]: <WorkSheetByShift />,
  [TAB_KEYS.HOURLY_PAYROLL]: <HourlyPayroll />,
  [TAB_KEYS.DETAILED_TIME_SHEET]: <DetailedTimeSheet />,
};
