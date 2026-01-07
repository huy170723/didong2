import { db } from '@/app/config/firebase';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { Order, OrderStatus } from '../../types/firebase';

export const orderService = {
    // Tạo order mới
    createOrder: async (orderData: Omit<Order, 'id' | 'createdAt'>): Promise<string> => {
        try {
            const orderWithTimestamp = {
                ...orderData,
                createdAt: Timestamp.now(),
                status: 'pending' as OrderStatus
            };

            const docRef = await addDoc(collection(db, 'orders'), orderWithTimestamp);
            return docRef.id;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    // Lấy order theo ID
    getOrderById: async (orderId: string): Promise<Order | null> => {
        try {
            const orderDoc = await getDoc(doc(db, 'orders', orderId));
            if (orderDoc.exists()) {
                return { id: orderDoc.id, ...orderDoc.data() } as Order;
            }
            return null;
        } catch (error) {
            console.error('Error getting order:', error);
            throw error;
        }
    },

    // Lấy orders của user
    getUserOrders: async (userId: string): Promise<Order[]> => {
        try {
            const q = query(
                collection(db, 'orders'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
        } catch (error) {
            console.error('Error getting user orders:', error);
            throw error;
        }
    },

    // Cập nhật trạng thái order
    updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<void> => {
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                status,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    },

    // Hủy order
    cancelOrder: async (orderId: string): Promise<void> => {
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                status: 'cancelled',
                cancelledAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Error cancelling order:', error);
            throw error;
        }
    },

    // Lấy tất cả orders (admin)
    getAllOrders: async (): Promise<Order[]> => {
        try {
            const q = query(
                collection(db, 'orders'),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
        } catch (error) {
            console.error('Error getting all orders:', error);
            throw error;
        }
    }
};