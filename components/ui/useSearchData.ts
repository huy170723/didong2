// useSearchData.ts

import { useEffect, useState } from 'react';

// --- ĐỊNH NGHĨA TYPES (Giữ nguyên) ---
interface Medicine {
  id: number; name: string; category: string; price: number; inStock: boolean;
  prescription: boolean; rating: number; description: string;
}
interface Pharmacy {
  id: number; name: string; distance: string; rating: number; openNow: boolean;
  address: string;
}

// --- HÀM GIẢ ĐỊNH GỌI API (Giữ nguyên) ---
async function fetchMedicinesApi(query: string, category: string): Promise<Medicine[]> {
  // Thay thế bằng fetch() thực tế của bạn
  const mockData: Medicine[] = [
    { id: 1, name: 'Aspirin 100mg', category: 'pain', price: 18000, inStock: true, prescription: false, rating: 4.5, description: 'Giảm đau và hạ sốt' },
    { id: 2, name: 'Vitamin D3 1000 IU', category: 'vitamins', price: 35000, inStock: true, prescription: false, rating: 4.8, description: 'Hỗ trợ xương và miễn dịch' },
  ];
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockData.filter(med => 
    (med.name.toLowerCase().includes(query.toLowerCase())) && (category === 'all' || med.category === category)
  );
}

async function fetchPharmaciesApi(query: string): Promise<Pharmacy[]> {
  // Thay thế bằng fetch() thực tế của bạn
  const mockData: Pharmacy[] = [
    { id: 1, name: 'Nhà thuốc Sức Khỏe', distance: '0.8 km', rating: 4.8, openNow: true, address: '123 Đường Chính' },
    { id: 2, name: 'Nhà thuốc MediQuick', distance: '1.9 km', rating: 4.6, openNow: true, address: '456 Đường Lê Lợi' },
  ];
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockData.filter(pharmacy => pharmacy.name.toLowerCase().includes(query.toLowerCase()));
}

export const categories = [
  { id: 'all', label: 'Tất cả' }, { id: 'pain', label: 'Giảm đau' }, 
  { id: 'vitamins', label: 'Vitamin' }, { id: 'cold', label: 'Cảm cúm' }, 
  { id: 'skincare', label: 'Chăm sóc da' }
];

export function useSearchData(searchQuery: string, selectedCategory: string, activeTab: string) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effect cho Thuốc
  useEffect(() => {
    if (activeTab === 'medicines') {
      const loadMedicines = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await fetchMedicinesApi(searchQuery, selectedCategory);
          setMedicines(data);
        } catch (err) {
          setError("Không thể tải dữ liệu thuốc.");
          setMedicines([]);
        } finally {
          setIsLoading(false);
        }
      };
      loadMedicines();
    }
  }, [searchQuery, selectedCategory, activeTab]);

  // Effect cho Nhà thuốc
  useEffect(() => {
    if (activeTab === 'pharmacies') {
      const loadPharmacies = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await fetchPharmaciesApi(searchQuery);
          setPharmacies(data);
        } catch (err) {
          setError("Không thể tải dữ liệu nhà thuốc.");
          setPharmacies([]);
        } finally {
          setIsLoading(false);
        }
      };
      loadPharmacies();
    }
  }, [searchQuery, activeTab]);

  return { medicines, pharmacies, isLoading, error, categories };
}