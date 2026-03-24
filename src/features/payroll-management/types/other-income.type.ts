import type {
  AllowanceList,
  AttachmentList,
  DepartmentList,
  EntryPersonList,
  RoomList,
  StaffList,
} from '@/types/global.type';

import type { KpiSourceEnum } from './kpi.type';

export enum OtherIncomeTypeEnum {
  PROJECT_BONUS = 'PROJECT_BONUS',
  PERFORMANCE_FEE = 'PERFORMANCE_FEE',
  OTHER_INCOME = 'OTHER_INCOME',
}

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
  attachments: { fileUrl: string; filePath: string; fileName: string; fileType: string; fileSize: number; }[];
}

export type OtherUpdate = {
  id: string | number;
  payload: OtherIncomePayload;
};

export interface OtherIncome {
  id: string;
  staff: StaffList;
  departments: DepartmentList[];
  rooms: RoomList[];
  month: string;
  type: OtherIncomeTypeEnum;
  description: string;
  amount: number;
  source: KpiSourceEnum;
  entryPerson: EntryPersonList;
  date: string;
  allowance: AllowanceList;
  attachments: AttachmentList[];
  createdAt: string;
}
