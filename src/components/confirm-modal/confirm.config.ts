export type ConfirmAction = 'approve' | 'reject' | 'delete';

export interface ConfirmConfig {
  title: string;
  description: string;
  confirmLabel: string;
  confirmColor: 'primary' | 'danger';
  requireReason?: boolean;
}

export const CONFIRM_CONFIG: Record<ConfirmAction, ConfirmConfig> = {
  approve: {
    title: 'Xác nhận phê duyệt',
    description:
      'Bạn có chắc chắn muốn xác nhận giải trình công này không? Hành động này không thể hoàn tác.',
    confirmLabel: 'Xác nhận',
    confirmColor: 'primary',
  },
  reject: {
    title: 'Xác nhận từ chối',
    description: 'Vui lòng nhập lý do từ chối để nhân viên có thể nắm được thông tin.',
    confirmLabel: 'Từ chối',
    confirmColor: 'danger',
    requireReason: true,
  },
  delete: {
    title: 'Xác nhận xóa',
    description: 'Bạn có chắc chắn muốn xóa tài liệu này không? Hành động này không thể hoàn tác.',
    confirmLabel: 'Xóa',
    confirmColor: 'danger',
  },
};
