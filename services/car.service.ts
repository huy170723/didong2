import { API_ENDPOINTS } from '../constants/config';
import { Car, CarResponse } from '../types';
import api from './api';

export const carService = {
  getAllCars: async (filters?: any): Promise<CarResponse> => {
    try {
      console.log('[Car Service] Đang lấy danh sách xe với filters:', filters);
      
      const response = await api.get(API_ENDPOINTS.CARS, {
        params: {
          ...filters,
          limit: 20 // Lấy nhiều xe một lúc
        }
      });
      
      console.log('[Car Service] Lấy được', response.data.data?.length || 0, 'xe');
      return response.data;
    } catch (error: any) {
      console.error('[Car Service] Lỗi lấy danh sách xe:', error.response?.data || error.message);
      throw error;
    }
  },

  getCarById: async (id: number): Promise<Car> => {
    try {
      console.log('[Car Service] Đang lấy chi tiết xe ID:', id);
      
      const response = await api.get(API_ENDPOINTS.CAR_DETAIL, {
        params: { id }
      });
      
      console.log('[Car Service] Lấy chi tiết xe thành công');
      return response.data.data;
    } catch (error: any) {
      console.error('[Car Service] Lỗi lấy chi tiết xe:', error.response?.data || error.message);
      throw error;
    }
  },

  searchCars: async (keyword: string, filters?: any): Promise<CarResponse> => {
    try {
      console.log('[Car Service] Đang tìm kiếm xe với từ khóa:', keyword);
      
      const response = await api.get(API_ENDPOINTS.CARS, {
        params: {
          search: keyword,
          ...filters
        }
      });
      
      console.log('[Car Service] Tìm thấy', response.data.data?.length || 0, 'xe');
      return response.data;
    } catch (error: any) {
      console.error('[Car Service] Lỗi tìm kiếm xe:', error.response?.data || error.message);
      throw error;
    }
  },
};