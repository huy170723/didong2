// app/hooks/useBrands.ts
import { db } from '@/service/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  carCount: number;
}

export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      // Lấy tất cả xe để thống kê
      const carsRef = collection(db, 'cars');
      const snapshot = await getDocs(carsRef);
      
      // Thống kê số lượng xe theo brand
      const brandCounts: Record<string, number> = {};
      snapshot.docs.forEach(doc => {
        const car = doc.data();
        brandCounts[car.brand] = (brandCounts[car.brand] || 0) + 1;
      });

      // Tạo mảng brands
      const brandsData = Object.keys(brandCounts).map(brandName => ({
        id: brandName.toLowerCase().replace(/\s+/g, '-'),
        name: brandName,
        carCount: brandCounts[brandName]
      }));

      setBrands(brandsData);
    } catch (err) {
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return { brands, loading, refetch: fetchBrands };
};