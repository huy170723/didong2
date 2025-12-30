// app/hooks/useCarCategories.ts
import { db } from '@/service/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export const useCarCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const carsRef = collection(db, 'cars');
      const snapshot = await getDocs(carsRef);
      
      // Thống kê số lượng xe theo type
      const typeCounts: Record<string, number> = {};
      snapshot.docs.forEach(doc => {
        const car = doc.data();
        typeCounts[car.type] = (typeCounts[car.type] || 0) + 1;
      });

      // Mapping type to icon
      const typeToIcon: Record<string, string> = {
        'Sedan': 'car',
        'SUV': 'car-sport',
        'Hatchback': 'car',
        'MPV': 'car',
        'Bán tải': 'truck',
        'Coupe': 'car',
        'SUV Điện': 'flash',
        'Điện': 'flash'
      };

      // Tạo mảng categories
      const categoriesData = Object.keys(typeCounts).map(typeName => ({
        id: typeName.toLowerCase().replace(/\s+/g, '-'),
        name: typeName,
        icon: typeToIcon[typeName] || 'car',
        count: typeCounts[typeName]
      }));

      // Thêm category "Tất cả"
      const totalCars = snapshot.docs.length;
      const allCategory: Category = {
        id: 'all',
        name: 'Tất cả',
        icon: 'grid',
        count: totalCars
      };

      setCategories([allCategory, ...categoriesData]);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, refetch: fetchCategories };
};