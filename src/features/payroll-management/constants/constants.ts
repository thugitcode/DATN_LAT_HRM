import { Status, type Options } from '@/types/global.type';

export const statusKpiOptions: Options[] = [
  {
    label: 'Đã xác nhận',
    key: Status.APPROVED,
  },
  {
    label: 'Chờ xác nhận',
    key: Status.PENDING,
  },
  {
    label: 'Từ chối',
    key: Status.REJECTED,
  },
];

export const statusRevenueOptions: Options[] = [
  {
    label: 'Đã xác nhận',
    key: Status.APPROVED,
  },
  {
    label: 'Chờ xác nhận',
    key: Status.PENDING,
  }
];
