import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../constants/config';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor để debug
api.interceptors.request.use(
  async (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    console.log('[API Request Data]', config.data);
    
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API Token]', token);
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor để debug
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response Success] ${response.status} ${response.config.url}`);
    console.log('[API Response Data]', response.data);
    return response;
  },
  async (error) => {
    console.error('[API Response Error]', error.message);
    console.error('[API Error URL]', error.config?.url);
    console.error('[API Error Data]', error.config?.data);
    console.error('[API Error Response]', error.response?.data);
    console.error('[API Error Status]', error.response?.status);
    
    if (error.response?.status === 401) {
      console.log('[API] Token hết hạn, đăng xuất...');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      // Có thể chuyển hướng đến login ở đây
      // router.replace('/(auth)/login');
    }
    
    // Nếu là lỗi mạng
    if (error.code === 'ECONNABORTED' || error.message.includes('Network Error')) {
      console.warn('[API] Lỗi mạng, kiểm tra kết nối và XAMPP');
      return Promise.reject({
        message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và XAMPP.',
        code: 'NETWORK_ERROR'
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;