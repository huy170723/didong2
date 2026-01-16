export interface Car {
  id: string; // Firestore document ID
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  phone_number: string;
  color: string;
  description: string;
  images: string[];
  image_url: string;
  status: 'available' | 'rented' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  address?: string;
}

export interface Favorite {
  id: string;
  userId: string;
  carId: string;
  createdAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  carId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
}