import type { ShiftType } from '../types/type';

export const COL_W = 96;
export const ROW_H = 60;
export const ROW_GAP = 4;
export const ROW_PY = 8;
export const STAFF_COL_W = 220;

export const SHIFT_COLORS: Record<ShiftType, string> = {
  main: 'bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]',
  alternate: 'bg-[#FEF9C3] text-[#92400E] border-[#FDE68A]',
  direct: 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]',
  flexible: 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
  off: 'bg-[#F4F4F5] text-[#A1A1AA] border-[#E4E4E7]',
};
