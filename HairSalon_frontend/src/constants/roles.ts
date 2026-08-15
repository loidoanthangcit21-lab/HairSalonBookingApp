export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  RECEPTIONIST = 'RECEPTIONIST',
  STYLIST = 'STYLIST',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: 'Customer',
  [UserRole.RECEPTIONIST]: 'Receptionist',
  [UserRole.STYLIST]: 'Stylist',
};
