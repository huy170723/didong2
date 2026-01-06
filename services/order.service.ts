import { ApiResponse, Order } from '../types';

// Mock data for demo
const MOCK_ORDERS: Order[] = [
  {
    id: 1,
    car_id: 1,
    user_id: 1,
    total_price: 850000000,
    status: 'completed',
    payment_method: 'Chuyển khoản',
    shipping_address: '123 Đường ABC, Quận 1, TP.HCM',
    notes: 'Giao hàng vào cuối tuần',
    created_at: '2024-01-10',
    car: {
      id: 1,
      name: 'Toyota Camry 2020',
      brand: 'Toyota',
      model: 'Camry',
      year: 2020,
      price: 850000000,
      mileage: 15000,
      fuel_type: 'gasoline',
      transmission: 'automatic',
      color: 'Đen',
      description: 'Xe mới đẹp, full option',
      images: ['camry1.jpg'],
      image_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop',
      status: 'available',
      created_at: '2024-01-01',
    },
  },
];

export const orderService = {
  getUserOrders: async (userId: number): Promise<ApiResponse<Order[]>> => {
    try {
      // For demo, return mock orders
      return {
        success: true,
        data: MOCK_ORDERS,
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },
};