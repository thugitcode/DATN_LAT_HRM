export const UserRole = {
  QUAN_TRI: 'QUAN_TRI',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface UserListItem {
  ID: string;
  USERNAME: string;
  HO: string;
  TEN: string;
  EMAIL: string | null;
  SO_DIEN_THOAI: string | null;
  CHUC_DANH: string | null;
  GHI_CHU: string | null;
  NHOM_NHAN_VIEN: UserRole;
  tenant_code: string;
}

export interface UserDetailItem extends UserListItem {}

export type FilterAllUsersParams = Partial<{
  search: string;
  tenant_code: string;
  NHOM_NHAN_VIEN: string;
}>;
