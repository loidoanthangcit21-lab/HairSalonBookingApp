export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: 'Khách Hàng',
  [UserRole.ADMIN]: 'Quản Trị Viên / Thu Ngân',
};
