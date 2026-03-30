import type { TimelineType } from "../types";

export enum TAB_KEYS {
  WORKSHEET_BY_SHIFT = 'worksheet-by-shift',
  SHIFT_EXPLANATION = 'shift-explanation',
  SHIFT_ASSIGNMENT = 'shift-assignment',
}

export const tabs = [
  { label: 'Chấm công', key: TAB_KEYS.WORKSHEET_BY_SHIFT },
  { label: 'Giải trình ca', key: TAB_KEYS.SHIFT_EXPLANATION },
  { label: 'Phân ca', key: TAB_KEYS.SHIFT_ASSIGNMENT },
];

export const EMPTY_TYPE: TimelineType = 'OTHER';
export const EMPTY_COLOR = '#E4E4E7';