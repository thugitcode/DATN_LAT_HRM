import { KpiRatingEnum, KpiSourceEnum } from '../types/kpi.type';

export const RATING_OPTIONS = [
  { key: KpiRatingEnum.EXCELLENT, label: 'Xuất sắc' },
  { key: KpiRatingEnum.GOOD, label: 'Đạt' },
  { key: KpiRatingEnum.NOT_MET, label: 'Chưa đạt' },
];

export const getRatingLabel = (rating?: KpiRatingEnum) => {
  return RATING_OPTIONS.find((option) => option.key === rating)?.label ?? rating;
};

export const KPI_SOURCE_LABEL = {
  [KpiSourceEnum.WEB]: 'Website',
  [KpiSourceEnum.MOBILE]: 'Mobile',
};
