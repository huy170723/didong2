export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string;
  created_at: string;
}

export interface Car {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic';
  color: string;
  description: string;
  images: string[];
  image_url: string;
  status: 'available' | 'sold' | 'pending';
  created_at: string;
}

export interface Order {
  id: number;
  car_id: number;
  user_id: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_method: string;
  shipping_address: string;
  notes: string;
  created_at: string;
  car?: Car;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface CarResponse {
  success: boolean;
  data: Car[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}