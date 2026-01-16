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
    startAfter
} from 'firebase/firestore';
import { Car } from '../../types/firebase';

export const carService = {
    // 1. LẤY TẤT CẢ XE (Phân trang và giữ dữ liệu cũ)
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
                    image_url: data.image_url || 'https://via.placeholder.com/400x200?text=No+Image',
                } as Car;
            });

            return { cars, lastVisible };
        } catch (error) {
            console.error('Lỗi khi lấy danh sách xe:', error);
            throw error;
        }
    },

    // 2. HÀM TÌM KIẾM (Đã sửa lỗi không ra kết quả)
    searchCars: async (searchText: string): Promise<Car[]> => {
        try {
            const searchLower = searchText.toLowerCase();

            // BỎ điều kiện where('status', '==', 'available') vì dữ liệu mẫu chưa có trường này
            const q = query(collection(db, 'cars'));

            const querySnapshot = await getDocs(q);

            const results = querySnapshot.docs
                .map(doc => {
                    const data = doc.data();
                    return { id: doc.id, ...data } as Car;
                })
                .filter(car => {
                    // Kiểm tra an toàn để tránh lỗi nếu dữ liệu thiếu trường
                    const name = (car.name || '').toLowerCase();
                    const brand = (car.brand || '').toLowerCase();
                    const desc = (car.description || '').toLowerCase();

                    return name.includes(searchLower) ||
                        brand.includes(searchLower) ||
                        desc.includes(searchLower);
                });

            return results;
        } catch (error) {
            console.error('Lỗi khi tìm kiếm xe:', error);
            return [];
        }
    },

    // 3. LẤY CHI TIẾT XE
    getCarById: async (carId: string): Promise<Car | null> => {
        try {
            const carDoc = await getDoc(doc(db, 'cars', carId));
            if (carDoc.exists()) {
                const data = carDoc.data();
                return {
                    id: carDoc.id,
                    ...data,
                } as Car;
            }
            return null;
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết xe:', error);
            throw error;
        }
    }
};