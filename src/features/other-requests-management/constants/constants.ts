import { OtherStatusEnum } from '../types/type';

export const statusLabel = {
  [OtherStatusEnum.APPROVED]: 'Đã duyệt',
  [OtherStatusEnum.PENDING]: 'Chờ duyệt',
  [OtherStatusEnum.REJECTED]: 'Từ chối',
};

export const statusOtherRequestOptions = [
  { key: OtherStatusEnum.APPROVED, label: 'Đã duyệt' },
  { key: OtherStatusEnum.PENDING, label: 'Chờ duyệt' },
  { key: OtherStatusEnum.REJECTED, label: 'Từ chối' },
];
