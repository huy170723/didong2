// app/hooks/useCars.ts
import { db } from '@/service/firebase';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export interface Car {
  id: string;
  name: string;
  brand: string;
  price: number;
  images: string[];
  type: string;
  fuelType: string;
  transmission: string;
  year: number;
  mileage: number;
  color: string;
  seats: number;
  features: string[];
  description: string;
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  createdAt: any;
}

export const useCars = (category?: string, brand?: string) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = async () => {
    try {
      setLoading(true);
      let carsQuery = query(collection(db, 'cars'), orderBy('createdAt', 'desc'));

      // Filter by category if provided
      if (category && category !== 'all') {
        carsQuery = query(carsQuery, where('type', '==', category));
      }

      // Filter by brand if provided
      if (brand) {
        carsQuery = query(carsQuery, where('brand', '==', brand));
      }

      const snapshot = await getDocs(carsQuery);
      
      const carsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Car[];
      
      setCars(carsData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching cars:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [category, brand]);

  return { cars, loading, error, refetch: fetchCars };
};

export const useFeaturedCars = () => {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeaturedCars = async () => {
    try {
      setLoading(true);
      const carsRef = collection(db, 'cars');
      const q = query(carsRef, where('isAvailable', '==', true), orderBy('rating', 'desc'), limit(6));
      const snapshot = await getDocs(q);
      
      const carsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Car[];
      
      setFeaturedCars(carsData);
    } catch (err) {
      console.error('Error fetching featured cars:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedCars();
  }, []);

  return { featuredCars, loading, refetch: fetchFeaturedCars };
};