import { OtherIncomeTypeEnum } from '../types/other-income.type';

export const OTHER_INCOME_TYPE_OPTIONS = [
  { key: OtherIncomeTypeEnum.PROJECT_BONUS, label: 'Thưởng dự án' },
  { key: OtherIncomeTypeEnum.PERFORMANCE_FEE, label: 'Phí hiệu suất' },
  { key: OtherIncomeTypeEnum.OTHER_INCOME, label: 'Thu nhập khác' },
];

export const OTHER_INCOME_TYPE_LABEL = {
  [OtherIncomeTypeEnum.PROJECT_BONUS]: 'Thưởng dự án',
  [OtherIncomeTypeEnum.PERFORMANCE_FEE]: 'Phí hiệu suất',
  [OtherIncomeTypeEnum.OTHER_INCOME]: 'Thu nhập khác',
};
