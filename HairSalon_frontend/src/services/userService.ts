import { ENV } from '../config/env';
import { MOCK_USERS } from '../mocks/mockUsers';
import { NotificationItem, UserProfile } from '../types/user';
import { apiClient } from './apiClient';

const delay = (ms: number) => new Promise((res) => setTimeout(() => res(true), ms));

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Booking Confirmed!',
    message: 'Your appointment #BK-8892 with David Miller has been confirmed for 09:00 AM.',
    timestamp: '10 mins ago',
    read: false,
    type: 'booking',
  },
  {
    id: 'notif_2',
    title: 'Special Haircare Promotion',
    message: 'Get 20% off all Coloring & Perming treatments this weekend!',
    timestamp: '2 hours ago',
    read: true,
    type: 'promo',
  },
];

export const userService = {
  async getProfile(): Promise<UserProfile> {
    if (ENV.USE_MOCK_DATA) {
      await delay(ENV.ARTIFICIAL_DELAY_MS);
      return MOCK_USERS[0];
    }
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    if (ENV.USE_MOCK_DATA) {
      await delay(ENV.ARTIFICIAL_DELAY_MS);
      return { ...MOCK_USERS[0], ...data };
    }
    const response = await apiClient.put('/user/profile', data);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    if (ENV.USE_MOCK_DATA) {
      await delay(ENV.ARTIFICIAL_DELAY_MS);
      return { success: true };
    }
    const response = await apiClient.post('/user/change-password', { currentPassword, newPassword });
    return response.data;
  },

  async getNotifications(): Promise<NotificationItem[]> {
    if (ENV.USE_MOCK_DATA) {
      await delay(ENV.ARTIFICIAL_DELAY_MS);
      return MOCK_NOTIFICATIONS;
    }
    const response = await apiClient.get('/user/notifications');
    return response.data;
  },
};
