import { db } from '@/config/firebase';
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
    // Lấy tất cả xe
    getAllCars: async (
        pageSize: number = 10,
        lastDoc?: QueryDocumentSnapshot<DocumentData>
    ): Promise<{ cars: Car[]; lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
        try {
            let q = query(
                collection(db, 'cars'),
                orderBy('createdAt', 'desc'),
                limit(pageSize)
            );

            if (lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const querySnapshot = await getDocs(q);
            const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

            const cars = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    name: data.name || 'Chưa có tên',
                    brand: data.brand || 'Khác',
                    price: data.price || 0,
                    year: data.year || 2024,
                    image_url: data.image_url || 'https://via.placeholder.com/400x200?text=No+Image',
                } as Car;
            });

            return { cars, lastVisible };
        } catch (error) {
            console.error('Lỗi khi lấy danh sách xe:', error);
            throw error;
        }
    },

    // --- HÀM TÌM KIẾM MỚI ĐƯỢC BỔ SUNG ---
    searchCars: async (searchText: string): Promise<Car[]> => {
        try {
            // Bước 1: Lấy các xe có status là available từ Firestore
            const q = query(
                collection(db, 'cars'),
                where('status', '==', 'available')
            );

            const querySnapshot = await getDocs(q);

            // Bước 2: Lọc thủ công ở Client để tìm kiếm không phân biệt hoa thường và linh hoạt hơn
            const searchLower = searchText.toLowerCase();

            const results = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Car))
                .filter(car => {
                    const name = car.name?.toLowerCase() || '';
                    const brand = car.brand?.toLowerCase() || '';
                    const model = car.model?.toLowerCase() || '';

                    return name.includes(searchLower) ||
                        brand.includes(searchLower) ||
                        model.includes(searchLower);
                });

            return results;
        } catch (error) {
            console.error('Lỗi khi tìm kiếm xe:', error);
            return [];
        }
    },

    getCarById: async (carId: string): Promise<Car | null> => {
        try {
            const carDoc = await getDoc(doc(db, 'cars', carId));
            if (carDoc.exists()) {
                const data = carDoc.data();
                return {
                    id: carDoc.id,
                    ...data,
                    price: data.price || 0,
                    year: data.year || 2024
                } as Car;
            }
            return null;
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết xe:', error);
            throw error;
        }
    }
};