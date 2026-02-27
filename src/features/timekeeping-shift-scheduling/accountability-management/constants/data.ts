import type { Options } from '@/types/global.type';

import { StatusAccountability } from '../types';

export const StatusAccountabilityLabel: Record<StatusAccountability, string> = {
  [StatusAccountability.ALL]: 'Tất cả',
  [StatusAccountability.PENDING]: 'Chờ xác nhận',
  [StatusAccountability.APPROVED]: 'Đã xác nhận',
  [StatusAccountability.REJECTED]: 'Từ chối',
};

export const statusAccountabilityOptions: Options[] = Object.values(StatusAccountability).map(
  (value) => ({
    key: value,
    label: StatusAccountabilityLabel[value],
  }),
);
