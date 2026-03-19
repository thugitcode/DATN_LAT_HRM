import type { KpiSourceEnum } from './kpi.type';

export enum OtherIncomeTypeEnum {
  PROJECT_BONUS = 'PROJECT_BONUS',
  PERFORMANCE_FEE = 'PERFORMANCE_FEE',
  OTHER_INCOME = 'OTHER_INCOME',
}

export interface OtherIncome {}

export interface OtherIncomePayload {
  staffId: string;
  month: string;
  type: string;
  description: string;
  amount: number;
  source: KpiSourceEnum;
  entryPersonId: string;
  date: string;
  allowanceId: string;
}

export type OtherUpdate = {
  id: string | number;
  payload: OtherIncomePayload;
};
