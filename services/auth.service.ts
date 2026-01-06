import { API_ENDPOINTS } from '../constants/config';
import { AuthResponse } from '../types';
import api from './api';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      console.log('[Auth] Đang đăng nhập với email:', email);
      
      const response = await api.post(API_ENDPOINTS.LOGIN, {
        email,
        password,
      });
      
      console.log('[Auth] Đăng nhập thành công');
      return response.data;
    } catch (error: any) {
      console.error('[Auth] Lỗi đăng nhập:', error.response?.data || error.message);
      throw error;
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      console.log('[Auth] Đang đăng ký với email:', data.email);
      
      const response = await api.post(API_ENDPOINTS.REGISTER, data);
      
      console.log('[Auth] Đăng ký thành công');
      return response.data;
    } catch (error: any) {
      console.error('[Auth] Lỗi đăng ký:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post(API_ENDPOINTS.LOGOUT);
      return response.data;
    } catch (error) {
      console.error('[Auth] Lỗi đăng xuất:', error);
      throw error;
    }
  },
};