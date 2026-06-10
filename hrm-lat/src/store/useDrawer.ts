import { create } from 'zustand';

export enum DrawerType {
  WORK_SHIFTS = 'WORK_SHIFTS',
  CHANGE_SHIFT_DIVISION = 'CHANGE_SHIFT_DIVISION',
  EXPLANATION_DETAIL = 'EXPLANATION_DETAIL',
  TIME_SHEET_DETAIL = 'TIME_SHEET_DETAIL',
  PROFILE_STAFF_DETAIL = 'PROFILE_STAFF_DETAIL',
  TIMEKEEPING_DETAILS = 'TIMEKEEPING_DETAILS',
  CREATE_KPI = 'CREATE_KPI',
  REVENUE_DETAILS = 'REVENUE_DETAILS',
  CREATE_OTHER_INCOME = 'CREATE_OTHER_INCOME',
  STAFF_MUTATE = 'STAFF_MUTATE',
  ADD_NEW_PAYROLL_PERIOD = 'ADD_NEW_PAYROLL_PERIOD',
  DETAIL_PAYSLIP_FEEDBACK = 'DETAIL_PAYSLIP_FEEDBACK',
  STAFF_CONTRACT_MUTATE = 'STAFF_CONTRACT_MUTATE',
  RECRUITMENT_REQUEST_MUTATE = 'RECRUITMENT_REQUEST_MUTATE',
  CANDIDATE_MUTATE = 'CANDIDATE_MUTATE',
  OFFER_MUTATE = 'OFFER_MUTATE',
  EVALUATION_MUTATE = 'EVALUATION_MUTATE',
  INTERVIEW_SCHEDULE_MUTATE = 'INTERVIEW_SCHEDULE_MUTATE',
  PROBATION_ACCEPT = 'PROBATION_ACCEPT',
  CANDIDATE_PROBATION_CREATE = 'CANDIDATE_PROBATION_CREATE',
  PROBATION_EVALUATION_MUTATE = 'PROBATION_EVALUATION_MUTATE',
}

interface DrawerState {
  isOpen: boolean;
  type: DrawerType | null;
  data: unknown;
  isDirty: boolean;

  onOpen: <D = unknown>(type: DrawerType, data?: D) => void;
  onClose: () => void;
  setDirty: (v: boolean) => void;
}

export const useDrawer = create<DrawerState>((set) => ({
  isOpen: false,
  type: null,
  data: undefined,
  isDirty: false,

  onOpen: (type, data) =>
    set({
      isOpen: true,
      type,
      data,
    }),

  onClose: () =>
    set({
      isOpen: false,
      type: null,
      data: undefined,
      isDirty: false,
    }),

  setDirty: (v) => set({ isDirty: v }),
}));
