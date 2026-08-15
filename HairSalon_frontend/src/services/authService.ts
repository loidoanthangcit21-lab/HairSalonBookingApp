import { ENV } from '../config/env';
import { UserRole } from '../constants/roles';
import { mockLogin } from '../mocks/mockAuth';
import { UserProfile } from '../types/user';
import { apiClient } from './apiClient';

const delay = (ms: number) => new Promise((res) => setTimeout(() => res(true), ms));

export const authService = {
  async login(emailOrPhone: string, role?: UserRole): Promise<{ token: string; user: UserProfile }> {
    if (ENV.USE_MOCK_DATA) {
      await delay(ENV.ARTIFICIAL_DELAY_MS);
      return mockLogin(emailOrPhone, role);
    }
    const response = await apiClient.post('/auth/login', { emailOrPhone, role });
    return response.data;
  },

  async register(data: { fullName: string; email: string; phone: string; password: string }): Promise<{ success: boolean }> {
    if (ENV.USE_MOCK_DATA) {
      await delay(ENV.ARTIFICIAL_DELAY_MS);
      return { success: true };
    }
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    if (ENV.USE_MOCK_DATA) {
      await delay(ENV.ARTIFICIAL_DELAY_MS);
      return { success: true, message: `OTP code sent to ${email}` };
    }
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  async verifyOTP(otp: string): Promise<{ success: boolean }> {
    if (ENV.USE_MOCK_DATA) {
      await delay(ENV.ARTIFICIAL_DELAY_MS);
      return { success: otp.length === 6 };
    }
    const response = await apiClient.post('/auth/verify-otp', { otp });
    return response.data;
  },

  async resetPassword(newPassword: string): Promise<{ success: boolean }> {
    if (ENV.USE_MOCK_DATA) {
      await delay(ENV.ARTIFICIAL_DELAY_MS);
      return { success: true };
    }
    const response = await apiClient.post('/auth/reset-password', { newPassword });
    return response.data;
  },
};
