import type { ReactNode } from 'react';
import type { LinkProps } from '@tanstack/react-router';

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
}
