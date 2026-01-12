import { db } from '@/app/config/firebase';
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp // Dùng cái này tốt hơn new Date() cho DB
    ,
    setDoc,
    where
} from 'firebase/firestore';
import { Car } from '../../types/firebase';

export const favoriteService = {
    // 1. Lấy danh sách yêu thích (Đã tối ưu hiệu năng)
    getUserFavorites: async (userId: string): Promise<Car[]> => {
        try {
            const q = query(
                collection(db, 'favorites'),
                where('userId', '==', userId)
            );

            const querySnapshot = await getDocs(q);
            const carIds = querySnapshot.docs.map(doc => doc.data().carId);

            if (carIds.length === 0) return [];

            // Tối ưu: Chạy tất cả các request getDoc cùng một lúc (song song)
            const carPromises = carIds.map(async (carId) => {
                const carDoc = await getDoc(doc(db, 'cars', carId));
                if (carDoc.exists()) {
                    return { id: carDoc.id, ...carDoc.data() } as Car;
                }
                return null;
            });

            const results = await Promise.all(carPromises);

            // Lọc bỏ những xe có thể đã bị xóa khỏi hệ thống (null)
            return results.filter((car): car is Car => car !== null);
        } catch (error) {
            console.error('Error getting favorites:', error);
            throw error;
        }
    },

    // 2. Thêm vào yêu thích (Dùng setDoc với ID tự định nghĩa để tránh trùng lặp)
    addFavorite: async (userId: string, carId: string): Promise<void> => {
        try {
            // Thay vì dùng addDoc (tạo ID ngẫu nhiên), ta dùng ID = userId_carId
            // Cách này giúp Firebase tự chặn trùng lặp mà không cần query kiểm tra trước
            const favoriteId = `${userId}_${carId}`;
            const favoriteRef = doc(db, 'favorites', favoriteId);

            await setDoc(favoriteRef, {
                userId,
                carId,
                createdAt: serverTimestamp() // Thời gian chuẩn server
            });
        } catch (error) {
            console.error('Error adding favorite:', error);
            throw error;
        }
    },

    // 3. Xóa khỏi yêu thích (Nhanh hơn vì có ID xác định)
    removeFavorite: async (userId: string, carId: string): Promise<void> => {
        try {
            const favoriteId = `${userId}_${carId}`;
            await deleteDoc(doc(db, 'favorites', favoriteId));
        } catch (error) {
            console.error('Error removing favorite:', error);
            throw error;
        }
    },

    // 4. Kiểm tra có trong yêu thích không
    isFavorite: async (userId: string, carId: string): Promise<boolean> => {
        try {
            const favoriteId = `${userId}_${carId}`;
            const docSnap = await getDoc(doc(db, 'favorites', favoriteId));
            return docSnap.exists();
        } catch (error) {
            console.error('Error checking favorite:', error);
            return false;
        }
    }
};