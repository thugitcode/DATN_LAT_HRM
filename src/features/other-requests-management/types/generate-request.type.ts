import type { StaffPosition, Status } from '@/types/global.type';

export enum CategoryGeneralRequest {
  BUSINESS_TRIP = 'BUSINESS_TRIP',
  OVERTIME = 'OVERTIME',
  REMOTE_WORK = 'REMOTE_WORK',
  TRAINING = 'TRAINING',
}

export enum RequestAttendanceTypeEnum {
  FULL_DAY = 'FULL_DAY',
  HALF_DAY = 'HALF_DAY',
  BY_HOUR = 'BY_HOUR',
}

export interface Department {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  name: string;
}

export interface GeneralRequest {
  id: string;
  code: string;
  category: CategoryGeneralRequest;
  title: string;
  reason: string;
  fromDate: string;
  toDate: string;
  startTime: string;
  endTime: string;
  totalHours: string;
  location: string;
  requestType: RequestAttendanceTypeEnum;
  status: Status;
  staffName: string;
  staffCode: string;

  position: StaffPosition;

  departments: Department[];
  rooms: Room[];

  managerNames: string[];

  createdAt: string;
}
