import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      console.log('[Auth Context] Đang tải dữ liệu từ storage...');
      
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      
      console.log('[Auth Context] Token từ storage:', storedToken ? 'Có' : 'Không');
      console.log('[Auth Context] User từ storage:', storedUser ? 'Có' : 'Không');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log('[Auth Context] Đã khôi phục đăng nhập');
      }
    } catch (error) {
      console.error('[Auth Context] Lỗi tải dữ liệu auth:', error);
    } finally {
      setIsLoading(false);
      console.log('[Auth Context] Hoàn tất tải dữ liệu');
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('[Auth Context] Bắt đầu đăng nhập...');
      
      const response = await authService.login(email, password);
      
      if (response.success && response.token && response.user) {
        console.log('[Auth Context] Đăng nhập thành công, lưu token và user');
        
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        
        setToken(response.token);
        setUser(response.user);
        return true;
      }
      
      console.log('[Auth Context] Đăng nhập thất bại:', response.message);
      return false;
    } catch (error: any) {
      console.error('[Auth Context] Lỗi đăng nhập:', error.message);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      console.log('[Auth Context] Bắt đầu đăng ký...');
      
      const response = await authService.register(data);
      
      if (response.success && response.token && response.user) {
        console.log('[Auth Context] Đăng ký thành công, lưu token và user');
        
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        
        setToken(response.token);
        setUser(response.user);
        return true;
      }
      
      console.log('[Auth Context] Đăng ký thất bại:', response.message);
      return false;
    } catch (error: any) {
      console.error('[Auth Context] Lỗi đăng ký:', error.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('[Auth Context] Đang đăng xuất...');
      
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      setToken(null);
      setUser(null);
      
      console.log('[Auth Context] Đăng xuất thành công');
    } catch (error) {
      console.error('[Auth Context] Lỗi đăng xuất:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}