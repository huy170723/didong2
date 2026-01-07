import { db } from '@/app/config/firebase';
import {
    collection,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    QueryDocumentSnapshot,
    startAfter,
    where
} from 'firebase/firestore';
import { Car } from '../../types/firebase';

export const carService = {
    // Lấy tất cả xe (với phân trang)
    getAllCars: async (
        pageSize: number = 10,
        lastDoc?: QueryDocumentSnapshot<DocumentData>
    ): Promise<{ cars: Car[]; lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
        try {
            let q = query(
                collection(db, 'cars'),
                where('status', '==', 'available'),
                orderBy('createdAt', 'desc'),
                limit(pageSize)
            );

            if (lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const querySnapshot = await getDocs(q);
            const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

            const cars = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Car[];

            return { cars, lastVisible };
        } catch (error) {
            console.error('Error getting cars:', error);
            throw error;
        }
    },

    // Lấy xe theo ID
    getCarById: async (carId: string): Promise<Car | null> => {
        try {
            const carDoc = await getDoc(doc(db, 'cars', carId));
            if (carDoc.exists()) {
                return { id: carDoc.id, ...carDoc.data() } as Car;
            }
            return null;
        } catch (error) {
            console.error('Error getting car:', error);
            throw error;
        }
    },

    // Tìm kiếm xe
    searchCars: async (searchText: string): Promise<Car[]> => {
        try {
            // Firestore không hỗ trợ full-text search, dùng filter client-side
            const q = query(
                collection(db, 'cars'),
                where('status', '==', 'available')
            );

            const querySnapshot = await getDocs(q);
            const cars = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Car))
                .filter(car =>
                    car.name.toLowerCase().includes(searchText.toLowerCase()) ||
                    car.brand.toLowerCase().includes(searchText.toLowerCase()) ||
                    car.model.toLowerCase().includes(searchText.toLowerCase())
                );

            return cars;
        } catch (error) {
            console.error('Error searching cars:', error);
            throw error;
        }
    },

    // Lọc xe
    filterCars: async (filters: {
        brand?: string;
        minPrice?: number;
        maxPrice?: number;
        fuelType?: string;
    }): Promise<Car[]> => {
        try {
            let q = query(
                collection(db, 'cars'),
                where('status', '==', 'available')
            );

            if (filters.brand) {
                q = query(q, where('brand', '==', filters.brand));
            }
            if (filters.fuelType) {
                q = query(q, where('fuel_type', '==', filters.fuelType));
            }

            const querySnapshot = await getDocs(q);
            let cars = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Car[];

            // Filter price client-side (Firestore chỉ hỗ trợ 1 range field)
            if (filters.minPrice || filters.maxPrice) {
                cars = cars.filter(car => {
                    const price = car.price;
                    if (filters.minPrice && price < filters.minPrice) return false;
                    if (filters.maxPrice && price > filters.maxPrice) return false;
                    return true;
                });
            }

            return cars;
        } catch (error) {
            console.error('Error filtering cars:', error);
            throw error;
        }
    }
};