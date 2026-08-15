export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  CASHIER = 'CASHIER',
  STYLIST = 'STYLIST',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: 'Customer',
  [UserRole.CASHIER]: 'Cashier / Cashier',
  [UserRole.STYLIST]: 'Stylist',
};
