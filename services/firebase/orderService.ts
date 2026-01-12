import { db } from '@/app/config/firebase';
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { Car } from '../../types/firebase';

export const orderService = {
    // Thêm xe vào giỏ hàng
    addToCart: async (userId: string, car: Car) => {
        try {
            await addDoc(collection(db, 'orders'), {
                userId,
                carId: car.id,
                carName: car.name,
                price: car.price,
                image: car.image_url || car.images?.[0],
                status: 'pending', // Trạng thái chờ xử lý (trong giỏ hàng)
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Error adding to cart: ", error);
            throw error;
        }
    },

    // Lấy danh sách xe trong giỏ hàng của user
    getUserOrders: async (userId: string) => {
        const q = query(collection(db, 'orders'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};