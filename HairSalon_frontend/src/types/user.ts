import { UserRole } from '../constants/roles';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  role: UserRole;
  avatarUrl?: string;
  specialty?: string;
  experienceYears?: number;
  bio?: string;
  rating?: number;
  portfolioImages?: string[];
}

export interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type?: 'booking' | 'system' | 'promo';
}
