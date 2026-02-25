import { StaffPosition } from '@/types/global.type';
import type { SelectOption } from '@/components/filters/filter-select';

import { ShiftTypeEnum } from '../types/type';

export const KHOA_OPTIONS: readonly SelectOption[] = [
  { key: 'khoa-noi', label: 'Khoa nội' },
  { key: 'khoa-ngoai', label: 'Khoa ngoại' },
] as const;

export const PHONG_OPTIONS: readonly SelectOption[] = [
  { key: 'phong-ky-thuat', label: 'Phòng kỹ thuật' },
  { key: 'phong-massage', label: 'Phòng massage' },
] as const;

export const ShiftCa = [
  {
    label: 'Ca chính',
  },
  {
    label: 'Ca gãy',
  },
  {
    label: 'Ca trực',
  },
  {
    label: 'Ca linh hoạt',
  },
  {
    label: 'Không có ca',
  },
];

export const STAFF_POSITION = {
  [StaffPosition.STAFF]: 'Nhân viên',
  [StaffPosition.HEAD_OF_DEPARTMENT]: 'Trưởng khoa',
  [StaffPosition.DEPUTY_HEAD_OF_DEPARTMENT]: 'Phó khoa',
  [StaffPosition.CHIEF_NURSE]: 'Điều dưỡng trưởng',
  [StaffPosition.MANAGER]: 'Trưởng phòng',
  [StaffPosition.HEAD_OF_UNIT]: 'Trưởng bộ phận',
  [StaffPosition.DEPUTY_MANAGER]: 'Phó phòng',
};

export const shiftTypeOoptions = [
  {
    key: ShiftTypeEnum.FIXED,
    label: 'Ca cố định',
  },
  {
    key: ShiftTypeEnum.FLEXIBLE,
    label: 'Ca linh hoạt',
  },
  {
    key: ShiftTypeEnum.ON_DUTY,
    label: 'Ca trực',
  },
  {
    key: '',
    label: '',
  },
  {
    key: '',
    label: '',
  },
];
