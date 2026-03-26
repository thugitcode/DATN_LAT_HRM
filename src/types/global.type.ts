import type { ReactNode } from 'react';
import type { LinkProps } from '@tanstack/react-router';

import type { ContractTypeEnum, StaffPositionEnum } from './staff.type';

export type GlobalSearchParams = {
  jwt?: string | null;
};

export interface MenuItem {
  label: string;
  path: LinkProps['to'];
  id: string;
  icon?: ReactNode;
  children?: {
    id: string;
    label: string;
    path: LinkProps['to'];
  }[];
}

export enum LayoutSwitcherEnum {
  LIST = 'LIST',
  GRID = 'GRID',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum StaffPosition {
  STAFF = 'STAFF', // Nhân viên
  HEAD_OF_DEPARTMENT = 'HEAD_OF_DEPARTMENT', // Trưởng khoa
  DEPUTY_HEAD_OF_DEPARTMENT = 'DEPUTY_HEAD_OF_DEPARTMENT', // Phó khoa
  CHIEF_NURSE = 'CHIEF_NURSE', // Điều dưỡng trưởng
  MANAGER = 'MANAGER', // Trưởng phòng
  HEAD_OF_UNIT = 'HEAD_OF_UNIT', // Trưởng bộ phận
  DEPUTY_MANAGER = 'DEPUTY_MANAGER', // Phó phòng
}

export enum Status {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  WORKING = 'WORKING',
  RESIGNED = 'RESIGNED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  CONFIRMED = 'CONFIRMED',
}

export interface Options {
  key: string;
  label: string;
}

export interface RequestsParams {
  page?: number;
  limit?: number;
  staffId?: string;
  staffCode?: string;
  departmentId?: string;
  roomId?: string;
  startDate?: string;
  endDate?: string;
  position?: StaffPosition;
  search?: string;
  month?: string;
  year?: string;
  status?: string;
  getAll?: boolean;
  fromDate?: string;
  toDate?: string;

  jobTitle?: string;
  positions?: StaffPositionEnum[];
  departmentIds?: string[];
  roomIds?: string[];
  contractType?: ContractTypeEnum;

  [key: string]: unknown;
}

export interface DepartmentList {
  id: string;
  name: string;
}
export interface RoomList {
  id: string;
  name: string;
}

export interface StaffList {
  id: string;
  name: string;
  code: string;
}

export interface EntryPersonList {
  id: string;
  name: string;
}

export interface AllowanceList {
  id: string;
  name: string;
}

export interface AttachmentList {
  // chưa có dữ liệu nên để linh hoạt
  [key: string]: unknown;
}
