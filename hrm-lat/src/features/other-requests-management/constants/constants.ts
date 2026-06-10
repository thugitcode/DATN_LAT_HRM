import { CategoryGeneralRequest, RequestAttendanceTypeEnum } from '../types/generate-request.type';
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

export const CategoryGeneralRequestLabel: Record<CategoryGeneralRequest, string> = {
  [CategoryGeneralRequest.BUSINESS_TRIP]: 'Công tác',
  [CategoryGeneralRequest.OVERTIME]: 'Làm thêm giờ',
  [CategoryGeneralRequest.REMOTE_WORK]: 'Làm việc từ xa',
  [CategoryGeneralRequest.TRAINING]: 'Đào tạo',
};

export const RequestAttendanceTypeLabel: Record<RequestAttendanceTypeEnum, string> = {
  [RequestAttendanceTypeEnum.FULL_DAY]: 'Cả ngày',
  [RequestAttendanceTypeEnum.HALF_DAY]: 'Nửa ngày',
  [RequestAttendanceTypeEnum.BY_HOUR]: 'Theo giờ',
};
