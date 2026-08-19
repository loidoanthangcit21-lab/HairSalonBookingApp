import { NotificationItem, UserProfile } from '../types/user';
import { apiClient } from './apiClient';

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await apiClient.put('/user/profile', data);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    await apiClient.post('/user/change-password', { currentPassword, newPassword });
    return { success: true };
  },

  async getNotifications(): Promise<NotificationItem[]> {
    const response = await apiClient.get('/user/notifications');
    return response.data;
  },

  async markNotificationAsRead(id: string): Promise<{ success: boolean }> {
    await apiClient.patch(`/user/notifications/${id}/read`);
    return { success: true };
  },
};
