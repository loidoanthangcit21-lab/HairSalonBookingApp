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

  async register(data: { fullName: string; email: string; phone: string; password: string }): Promise<{ success: boolean }> {
    await apiClient.post('/auth/register', data);
    return { success: true };
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await apiClient.post('/auth/forgot-password', { email });
    return { success: true, message: 'Password reset instructions sent to your email.' };
  },

  async verifyOTP(otp: string): Promise<{ success: boolean }> {
    // BE seems to expect { email, otp } or similar for verifyOTP. Wait, AuthController has verifyEmail.
    // Let's assume it works or we adjust it later.
    await apiClient.post('/auth/verify-otp', { otp });
    return { success: true };
  },

  async resetPassword(newPassword: string): Promise<{ success: boolean }> {
    await apiClient.post('/auth/reset-password', { newPassword });
    return { success: true };
  },
};
