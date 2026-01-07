import type { SelectOptionsItemTypes, UseOptions } from '@/types';

export const useSubscriptionModuleOptions: UseOptions<
  SelectOptionsItemTypes['subscriptionModule']
> = () => {
  return {
    options: [
      { label: 'CIS', value: 'CIS' },
      { label: 'LIS nhập tay', value: 'LIS' },
      { label: 'Kết nối tự động máy XN', value: 'KET_NOI_TU_DONG_MAY_XN' },
      { label: 'RIS nhập tay', value: 'RIS' },
      { label: 'Tích hợp máy CDHA', value: 'TICH_HOP_MAY_CDHA' },
      { label: 'Dược ngoại trú', value: 'DUOC' },
      { label: 'Báo cáo', value: 'BAO_CAO' },
      { label: 'Quản lý kết quả, HSBA', value: 'QL_BENH_NHAN' },
      // { label: "PRM", value: "PRM" }, // Tạm ẩn đi vì bên mình đang setup thủ công cái này
      { label: 'Khám đoàn', value: 'KHAM_DOAN' },
      { label: 'BHYT', value: 'BHYT' },
      { label: 'Liên thông cổng dược', value: 'LIEN_THONG_CO_DUC' },
      // { label: "Quản trị", value: "MANAGEMENT" }, // Không cần hiện vì cái này mặc định luôn luôn có
      // { label: "Vật tư", value: "VAT_TU" },
    ],
  };
};
