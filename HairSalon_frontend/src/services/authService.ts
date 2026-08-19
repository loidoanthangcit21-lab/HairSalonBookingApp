import { ENV } from '../config/env';
import { mockLogin } from '../mocks/mockAuth';
import { UserProfile } from '../types/user';
import { apiClient } from './apiClient';

export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
    if (ENV.USE_MOCK_DATA) {
      return mockLogin(email);
    }
    const loginResponse = await apiClient.post('/auth/login', { email, password });
    
    const token = loginResponse.data.accessToken;
    
    const { storage } = await import('../utils/storage');
    await storage.setToken(token);
    
    const profileResponse = await apiClient.get('/user/profile');
    
    return { token, user: profileResponse.data };
  },

  async register(data: { fullName: string; email: string; phone?: string; password: string }): Promise<{ success: boolean }> {
    if (ENV.USE_MOCK_DATA) {
      return { success: true };
    }
    await apiClient.post('/auth/register', {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || '',
      password: data.password,
    });
    return { success: true };
  },



  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    if (ENV.USE_MOCK_DATA) {
      return { success: true, message: 'Password reset instructions sent to your email.' };
    }
    await apiClient.post('/auth/forgot-password', { email });
    return { success: true, message: 'Password reset instructions sent to your email.' };
  },

  async verifyOTP(otp: string, email?: string): Promise<{ success: boolean }> {
    if (ENV.USE_MOCK_DATA) {
      return { success: true };
    }
    await apiClient.post('/auth/verify-email', { otp, email: email || '' });
    return { success: true };
  },

  async resetPassword(newPassword: string, email?: string, otp?: string): Promise<{ success: boolean }> {
    if (ENV.USE_MOCK_DATA) {
      return { success: true };
    }
    await apiClient.post('/auth/reset-password', { newPassword, email: email || '', otp: otp || '' });
    return { success: true };
  },

  async resendVerificationEmail(email: string): Promise<{ success: boolean }> {
    if (ENV.USE_MOCK_DATA) {
      return { success: true };
    }
    await apiClient.post('/auth/resend-verification', { email });
    return { success: true };
  },

  async googleLogin(idToken: string): Promise<{ token: string; user: UserProfile }> {
    if (ENV.USE_MOCK_DATA) {
      return mockLogin('google.user@gmail.com');
    }
    const response = await apiClient.post('/auth/google', { idToken });
    const token = response.data.accessToken;

    const { storage } = await import('../utils/storage');
    await storage.setToken(token);

    const profileResponse = await apiClient.get('/user/profile');
    return { token, user: profileResponse.data };
  },
};






