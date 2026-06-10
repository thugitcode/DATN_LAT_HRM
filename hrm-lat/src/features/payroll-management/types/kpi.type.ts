import type { Status } from '@/types/global.type';

export enum KpiRatingEnum {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  NOT_MET = 'NOT_MET',
}

export enum KpiSourceEnum {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
}

export type KpiMutatePayload = {
  staffId: string;
  month: string;
  kpiScore: number;
  rating: KpiRatingEnum;
  evaluatorId: string;
  source: KpiSourceEnum;
  status: Status;
};

export type KpiUpdate = {
  id: string | number;
  payload: KpiMutatePayload;
};

export interface Staff {
  id: string;
  name: string;
  code: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  name: string;
}

export interface Evaluator {
  id: string;
  name: string;
}

export interface Kpi {
  id: string;
  staff: Staff;
  departments: Department[];
  rooms: Room[];
  month: string;
  kpiScore: number;
  rating: KpiRatingEnum;
  evaluator: Evaluator;
  source: KpiSourceEnum;
  status: Status;
  createdAt: string;
}
