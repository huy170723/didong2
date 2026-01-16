import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase'; // Đường dẫn đến file config firebase của bạn

export const createDeposit = async (userId: string, amount: number, data: any) => {
    try {
        const docRef = await addDoc(collection(db, "deposits"), {
            userId,
            amount,
            status: "pending",
            createdAt: serverTimestamp(),
            ...data
        });
        console.log("Thanh toán thành công, ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Lỗi khi lưu Firebase: ", e);
        throw e;
    }
};