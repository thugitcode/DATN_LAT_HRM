import type { TimelineType } from "../../types/types";

export enum TAB_KEYS {
  WORKSHEET_BY_SHIFT = 'worksheet-by-shift',
  SHIFT_EXPLANATION = 'shift-explanation',
  SHIFT_ASSIGNMENT = 'shift-assignment',
}

export const tabs = [
  { label: 'time_attendance.tabs.worksheet_by_shift', key: TAB_KEYS.WORKSHEET_BY_SHIFT },
  { label: 'time_attendance.tabs.shift_explanation', key: TAB_KEYS.SHIFT_EXPLANATION },
  { label: 'time_attendance.tabs.shift_assignment', key: TAB_KEYS.SHIFT_ASSIGNMENT },
];

export const EMPTY_TYPE: TimelineType = 'OTHER';
export const EMPTY_COLOR = '#E4E4E7';