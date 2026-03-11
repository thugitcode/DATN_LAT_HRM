import type { NAMESPACES } from '@/i18n/constants';
import type { TFunction } from 'i18next';

import {
  getDetailedTimeSheetLegendItems,
  getHourlyPayrollLegendItems,
  getWorkSheetLegendItems,
} from '../constants/data';
import { TAB_KEYS, type LegendItem } from '../types/index.type';

type TTimekeeping = TFunction<typeof NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING>;

export const getTabLegendMap = (t: TTimekeeping): Record<TAB_KEYS, LegendItem[]> => ({
  [TAB_KEYS.WORKSHEET_BY_SHIFT]: getWorkSheetLegendItems(t),
  [TAB_KEYS.HOURLY_PAYROLL]: getHourlyPayrollLegendItems(t),
  [TAB_KEYS.DETAILED_TIME_SHEET]: getDetailedTimeSheetLegendItems(t),
});
