import { db } from '@/app/config/firebase';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where
} from 'firebase/firestore';
import { Car } from '../../types/firebase';

export const favoriteService = {
    // Lấy danh sách yêu thích
    getUserFavorites: async (userId: string): Promise<Car[]> => {
        try {
            // Lấy favorite documents
            const q = query(
                collection(db, 'favorites'),
                where('userId', '==', userId)
            );

            const querySnapshot = await getDocs(q);
            const carIds = querySnapshot.docs.map(doc => doc.data().carId);

            // Lấy thông tin chi tiết xe
            const cars: Car[] = [];
            for (const carId of carIds) {
                const carDoc = await getDoc(doc(db, 'cars', carId));
                if (carDoc.exists()) {
                    cars.push({ id: carDoc.id, ...carDoc.data() } as Car);
                }
            }

            return cars;
        } catch (error) {
            console.error('Error getting favorites:', error);
            throw error;
        }
    },

    // Thêm vào yêu thích
    addFavorite: async (userId: string, carId: string): Promise<string> => {
        try {
            // Kiểm tra đã có chưa
            const q = query(
                collection(db, 'favorites'),
                where('userId', '==', userId),
                where('carId', '==', carId)
            );
            const existing = await getDocs(q);

            if (!existing.empty) {
                throw new Error('Car already in favorites');
            }

            // Thêm mới
            const docRef = await addDoc(collection(db, 'favorites'), {
                userId,
                carId,
                createdAt: new Date()
            });

            return docRef.id;
        } catch (error) {
            console.error('Error adding favorite:', error);
            throw error;
        }
    },

    // Xóa khỏi yêu thích
    removeFavorite: async (userId: string, carId: string): Promise<void> => {
        try {
            const q = query(
                collection(db, 'favorites'),
                where('userId', '==', userId),
                where('carId', '==', carId)
            );

            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                await deleteDoc(doc(db, 'favorites', querySnapshot.docs[0].id));
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
            throw error;
        }
    },

    // Kiểm tra có trong yêu thích không
    isFavorite: async (userId: string, carId: string): Promise<boolean> => {
        try {
            const q = query(
                collection(db, 'favorites'),
                where('userId', '==', userId),
                where('carId', '==', carId)
            );

            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error('Error checking favorite:', error);
            return false;
        }
    }
};