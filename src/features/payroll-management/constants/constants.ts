import { Status, type Options } from '@/types/global.type';

export const statusKpiOptions: Options[] = [
  {
    label: 'Đã xác nhận',
    key: Status.CONFIRMED,
  },
  {
    label: 'Chờ duyệt',
    key: Status.PENDING,
  },
];

export const statusRevenueOptions: Options[] = [
  {
    label: 'Đã xác nhận',
    key: Status.CONFIRMED,
  },
  {
    label: 'Chờ duyệt',
    key: Status.PENDING,
  },
];
