export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  CASHIER = 'CASHIER',
  STYLIST = 'STYLIST',
  ADMIN = 'ADMIN',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: 'Customer',
  [UserRole.CASHIER]: 'Cashier / Receptionist',
  [UserRole.STYLIST]: 'Stylist',
  [UserRole.ADMIN]: 'Admin / Receptionist',
};

