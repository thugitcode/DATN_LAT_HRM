import type { NAMESPACES } from '@/i18n/constants';
import type { TFunction } from 'i18next';

import { StaffPosition } from '@/types/global.type';
import { ShiftTypeEnum } from '@/types/shift-management.type';
import type { SelectOption } from '@/components/filters/filter-select';

import type { LegendItem } from '../../timekeeping-management/types/index.type';

type TTimekeeping = TFunction<typeof NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING>;

export const getShiftCaLegend = (t: TTimekeeping): LegendItem[] => [
  { label: t('shift_management.legend.fixed'), color: '#006FEE', status: ShiftTypeEnum.FIXED },
  { label: t('shift_management.legend.split'), color: '#F5A524', status: ShiftTypeEnum.SPLIT },
  { label: t('shift_management.legend.on_duty'), color: '#7828C8', status: ShiftTypeEnum.ON_DUTY },
  {
    label: t('shift_management.legend.flexible'),
    color: '#17C964',
    status: ShiftTypeEnum.FLEXIBLE,
  },
  { label: t('shift_management.legend.day_off'), color: '#F4F4F5', status: null, shape: 'line' },
];

export const getStaffPosition = (t: TTimekeeping): Record<StaffPosition, string> => ({
  [StaffPosition.STAFF]: t('staff_position.staff'),
  [StaffPosition.HEAD_OF_DEPARTMENT]: t('staff_position.head_of_department'),
  [StaffPosition.DEPUTY_HEAD_OF_DEPARTMENT]: t('staff_position.deputy_head_of_department'),
  [StaffPosition.CHIEF_NURSE]: t('staff_position.chief_nurse'),
  [StaffPosition.MANAGER]: t('staff_position.manager'),
  [StaffPosition.HEAD_OF_UNIT]: t('staff_position.head_of_unit'),
  [StaffPosition.DEPUTY_MANAGER]: t('staff_position.deputy_manager'),
});

export const getShiftTypeOptions = (t: TTimekeeping): SelectOption[] => [
  { key: ShiftTypeEnum.FIXED, label: t('shift_management.legend.fixed') },
  { key: ShiftTypeEnum.FLEXIBLE, label: t('shift_management.legend.flexible') },
  { key: ShiftTypeEnum.ON_DUTY, label: t('shift_management.legend.on_duty') },
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

export const SHIFT_CA_LEGEND: LegendItem[] = [
  {
    label: 'Ca cố định',
    color: '#006FEE',
    status: ShiftTypeEnum.FIXED,
  },

  {
    label: 'Ca gãy',
    color: '#F5A524',
    status: ShiftTypeEnum.SPLIT,
  },
  {
    label: 'Ca trực',
    color: '#7828C8',
    status: ShiftTypeEnum.ON_DUTY,
  },
  {
    label: 'Ca linh hoạt',
    color: '#17C964',
    status: ShiftTypeEnum.FLEXIBLE,
  },
  {
    label: 'Nghỉ',
    color: '#F4F4F5',
    status: null,
    shape: 'line',
  },
];
