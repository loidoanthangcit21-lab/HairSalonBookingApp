import { UserProfile } from '../types/user';
import { apiClient } from './apiClient';

export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
    // BE expects email, not emailOrPhone
    const loginResponse = await apiClient.post('/auth/login', { email: email, password });
    
    // loginResponse.data is unwrapped by interceptor to be { accessToken, refreshToken }
    const token = loginResponse.data.accessToken;
    
    // temporarily set token for the next request
    const { storage } = await import('../utils/storage');
    await storage.setToken(token);
    
    const profileResponse = await apiClient.get('/user/profile');
    
    return { token, user: profileResponse.data };
  },

  async googleLogin(idToken: string): Promise<{ token: string; user: UserProfile }> {
    const loginResponse = await apiClient.post('/auth/google', { idToken });
    const token = loginResponse.data.accessToken;
    const { storage } = await import('../utils/storage');
    await storage.setToken(token);
    const profileResponse = await apiClient.get('/user/profile');
    return { token, user: profileResponse.data };
  },

  async register(data: { firstName: string; lastName: string; email: string; phone: string; password: string }): Promise<{ success: boolean }> {
    await apiClient.post('/auth/register', data);
    return { success: true };
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await apiClient.post('/auth/forgot-password', { email });
    return { success: true, message: 'Password reset instructions sent to your email.' };
  },

  async verifyEmail(email: string, otp: string): Promise<{ success: boolean }> {
    await apiClient.post('/auth/verify-email', { email, otp });
    return { success: true };
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ success: boolean }> {
    await apiClient.post('/auth/reset-password', { email, otp, newPassword });
    return { success: true };
  },
};
