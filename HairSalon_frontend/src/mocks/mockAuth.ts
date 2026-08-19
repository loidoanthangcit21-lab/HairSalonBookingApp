import { UserRole } from '../constants/roles';
import { UserProfile } from '../types/user';
import { MOCK_USERS } from './mockUsers';

export const mockLogin = async (
  emailOrPhone: string,
  role?: UserRole
): Promise<{ token: string; user: UserProfile }> => {
  const targetRole = role || UserRole.CUSTOMER;
  const found = MOCK_USERS.find(
    (u) =>
      u.role === targetRole ||
      u.email.toLowerCase() === emailOrPhone.toLowerCase() ||
      u.phone === emailOrPhone
  );

  const user = found || {
    id: `usr_${Date.now()}`,
    fullName: emailOrPhone.split('@')[0] || 'User',
    email: emailOrPhone.includes('@') ? emailOrPhone : 'user@example.com',
    phone: emailOrPhone.match(/^\d+$/) ? emailOrPhone : '0900000000',
    role: targetRole,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  };

  return {
    token: `fake_jwt_token_${user.id}_${Date.now()}`,
    user,
  };
};
