export const mainMenuKeys = {
  DASHBOARD: 'DASHBOARD',
  PARTNERS: 'PARTNERS',
};

export const catalogTypes = {
  GENERAL: {
    OBJECT_GROUP: 'object-groups',
    DEPARTMENT: 'departments',
    ROOM: 'rooms',
    SERVICE_GROUP: 'service-groups',
    SERVICE_TYPE: 'service-types',
    STAFF: 'staffs',
    MODULE: 'modules',
  } as const,
  SERVICE: {
    MEDICAL_SERVICE: 'medical-services',
    PARACLINICAL_SERVICE: 'paraclinical-services',
    TEST_INDEX: 'test-indexes',
    CIRCULAR_13: 'circular-13s',
  } as const,
  DRUG: {
    DRUG_WAREHOUSE: 'drug-warehouses',
    DRUG: 'drugs',
  } as const,
};

export type CatalogGeneralType = (typeof catalogTypes.GENERAL)[keyof typeof catalogTypes.GENERAL];
export type CatalogServiceType = (typeof catalogTypes.SERVICE)[keyof typeof catalogTypes.SERVICE];
export type CatalogDrugType = (typeof catalogTypes.DRUG)[keyof typeof catalogTypes.DRUG];

/**
 * Query keys cho các dữ liệu tĩnh cần persist vào IndexedDB
 * Centralized query keys để đảm bảo consistency và type-safe
 */
export const persistedQueryKeys = {} as const;

/**
 * Whitelist các query keys cần persist vào IndexedDB
 * Tự động generate từ persistedQueryKeys
 */
export const PERSIST_WHITELIST = new Set<string>(Object.values(persistedQueryKeys));

/**
 * Thời gian tối đa cache được lưu (24 giờ)
 */
export const PERSIST_MAX_AGE = 1000 * 60 * 60 * 24; // 24 hours

/**
 * gcTime cho các query được persist (24 giờ)
 * Phải >= PERSIST_MAX_AGE
 */
export const PERSIST_GC_TIME = 1000 * 60 * 60 * 24; // 24 hours

/**
 * staleTime cho dữ liệu tĩnh (24 giờ)
 * Dữ liệu tĩnh sẽ không được refetch trong vòng 24 giờ
 */
export const STATIC_DATA_STALE_TIME = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Batch size cho bootstrap static data
 * 1 = tuần tự (an toàn, tránh overload server)
 * 2-3 = nhanh hơn nhưng vẫn controlled
 */
export const BOOTSTRAP_BATCH_SIZE = 1;

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 25;

export const RADIUS_INPUT = 8;

export const Message = {
  multiDeleteTitle: 'Xóa các bản ghi đã chọn',
  multiDeleteMessage: 'Bạn có chắc muốn xóa các bản ghi đã chọn?',
  deleteTitle: 'Xóa dữ liệu',
  deleteMessage: 'Bạn có chắc muốn xóa bản ghi đã chọn?',
  deleteDocumentMessage:
    'Dữ liệu sau khi xóa không thể khôi phục, bạn có chắc chắn muốn xóa tài liệu?',
  deleteNewMessage: 'Dữ liệu sau khi xóa không thể khôi phục, bạn có chắc chắn muốn xóa?',
  deleteSuccess: 'Xóa bản ghi thành công!',
  activeTitle: 'Kích hoạt tài khoản',
  activeMessage: 'Bạn có chắc muốn kích hoạt tài khoản?',
  activeSuccess: 'Kích hoạt tài khoản thành công!',
  deActiveTitle: 'Vô hiệu hóa tài khoản',
  deActiveMessage: 'Bạn có chắc muốn vô hiệu hóa tài khoản?',
  deActiveSuccess: 'Vô hiệu hóa tài khoản thành công!',
  error: 'Có lỗi xảy ra, vui lòng thử lại!',
  selectRecord: 'Vui lòng chọn bản ghi!',
};

export const ALLOWED_TYPES =
  'application/pdf,' +
  'application/msword,' +
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document,' +
  'application/vnd.ms-excel,' +
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' +
  'application/vnd.ms-powerpoint,' +
  'application/vnd.openxmlformats-officedocument.presentationml.presentation,' +
  'image/jpeg,' +
  'image/png';

export const STANDARD_HOURS = "07:00 - 17:00"