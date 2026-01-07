import axios from 'axios';
import { API_URL } from '../constants/config';

export const testConnection = async () => {
  try {
    console.log('[Test] Kiểm tra kết nối đến:', API_URL);
    
    const response = await axios.get(`${API_URL}/cars/get_cars.php`, {
      timeout: 10000,
    });
    
    console.log('[Test] Kết nối thành công!');
    console.log('[Test] Response:', response.data);
    
    return {
      success: true,
      message: 'Kết nối thành công đến máy chủ',
      data: response.data
    };
  } catch (error: any) {
    console.error('[Test] Lỗi kết nối:', error.message);
    
    let message = 'Không thể kết nối đến máy chủ';
    
    if (error.code === 'ECONNABORTED') {
      message = 'Timeout: Máy chủ không phản hồi';
    } else if (error.message.includes('Network Error')) {
      message = 'Lỗi mạng: Không thể kết nối đến máy chủ';
    } else if (error.response) {
      message = `Máy chủ trả về lỗi ${error.response.status}`;
    }
    
    return {
      success: false,
      message,
      error: error.message
    };
  }
};